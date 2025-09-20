import Map "mo:map/Map";
import NatBase "mo:base/Nat";
import Text "mo:base/Text";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Time "mo:base/Time";
import Bool "mo:base/Bool";
import T "../shared/Type";
import Iter "mo:base/Iter";
import NatCore "mo:core/Nat";

persistent actor {

  // ========= Helpers =========
  func dayStart(ts : Nat) : Nat { ts - (ts % 86400) };

  func pad2(n : Nat) : Text {
    if (n < 10) { "0" # NatBase.toText(n) } else { NatBase.toText(n) };
  };

  func isLeap(y : Nat) : Bool {
    // Gregorian
    (y % 4 == 0 and y % 100 != 0) or (y % 400 == 0);
  };

  func daysInYear(y : Nat) : Nat { if (isLeap(y)) 366 else 365 };

  func daysInMonth(y : Nat, m : Nat) : Nat {
    if (m == 1 or m == 3 or m == 5 or m == 7 or m == 8 or m == 10 or m == 12) 31 else if (m == 4 or m == 6 or m == 9 or m == 11) 30 else if (m == 2) {
      if (isLeap(y)) 29 else 28;
    } else 30;
  };

  func ymdFromUnix(ts : Nat) : Text {
    var days : Nat = ts / 86400;
    var y : Nat = 1970;
    label Y loop {
      let diy = daysInYear(y);
      if (days >= diy) { days -= diy; y += 1; continue Y } else {};
    };
    var m : Nat = 1;
    label M loop {
      let dim = daysInMonth(y, m);
      if (days >= dim) { days -= dim; m += 1; continue M } else {};
    };
    let d : Nat = days + 1;
    NatBase.toText(y) # "-" # pad2(m) # "-" # pad2(d);
  };

  func toAgo(nowS : Nat, t : Nat) : Text {
    if (nowS <= t) { "just now" } else {
      let d = NatBase.sub(nowS, t);
      if (d < 90) "just now" else if (d < 3600) NatBase.toText(d / 60) # " minutes ago" else if (d < 86400) NatBase.toText(d / 3600) # " hours ago" else NatBase.toText(d / 86400) # " days ago";
    };
  };

  func rangeDays(r : T.TimeRange) : Nat {
    switch (r) { case (#H24) 1; case (#D7) 7; case (#D30) 30; case (#D90) 90 };
  };

  // ========= Storage types =========
  type RawEvent = {
    resumeId : Text;
    event : T.AnalyticsEventType;
    visitor : Text;
    ts : Nat;
    durationMs : Nat;
    device : Text;
    country : Text;
    source : Text;
    section : ?Text;
  };

  type DailyAgg = {
    resumeId : Text;
    dayStart : Nat;
    views : Nat;
    shares : Nat;
    downloads : Nat;
    durationMsTotal : Nat;
    durationCount : Nat;
    bounceLt10s : Nat;
    visitors : [Text];
    devices : [(Text, Nat)];
    countries : [(Text, Nat)];
    sources : [(Text, Nat)];
    sections : [(Text, (Nat, Nat))];
  };

  // Menggunakan Map untuk penyimpanan, dengan kunci `resumeId`
  var aggsByResumeId : Map.Map<Text, [DailyAgg]> = Map.new();
  var rawsByResumeId : Map.Map<Text, [RawEvent]> = Map.new();
  transient let RAW_CAP : Nat = 2000;

  // ========= Small ops for KV arrays =========
  func incKV(arr : [(Text, Nat)], key : Text) : [(Text, Nat)] {
    var found = false;
    let out = Array.map<(Text, Nat), (Text, Nat)>(
      arr,
      func(p) {
        if (p.0 == key) { found := true; (p.0, p.1 + 1) } else p;
      },
    );
    if (found) out else Array.append(out, [(key, 1)]);
  };

  func addKV(arr : [(Text, Nat)], key : Text, add : Nat) : [(Text, Nat)] {
    var found = false;
    let out = Array.map<(Text, Nat), (Text, Nat)>(
      arr,
      func(p) {
        if (p.0 == key) { found := true; (p.0, p.1 + add) } else p;
      },
    );
    if (found) out else Array.append(out, [(key, add)]);
  };

  func incKV2(arr : [(Text, (Nat, Nat))], key : Text, addCount : Nat, addDur : Nat) : [(Text, (Nat, Nat))] {
    var found = false;
    let out = Array.map<(Text, (Nat, Nat)), (Text, (Nat, Nat))>(
      arr,
      func(p) {
        if (p.0 == key) {
          found := true;
          (p.0, (p.1.0 + addCount, p.1.1 + addDur));
        } else p;
      },
    );
    if (found) out else Array.append(out, [(key, (addCount, addDur))]);
  };

  func findAggIndex(aggs : [DailyAgg], d : Nat) : ?Nat {
    var i : Nat = 0;
    for (a in aggs.vals()) {
      if (a.dayStart == d) return ?i;
      i += 1;
    };
    null;
  };

  func ensureAgg(resumeId : Text, d : Nat) : (Nat, [DailyAgg]) {
    let currentAggs = switch (Map.get(aggsByResumeId, Map.thash, resumeId)) {
      case (?aggs) aggs;
      case null [];
    };

    switch (findAggIndex(currentAggs, d)) {
      case (?idx) (idx, currentAggs);
      case null {
        let newAgg : DailyAgg = {
          resumeId = resumeId;
          dayStart = d;
          views = 0;
          shares = 0;
          downloads = 0;
          durationMsTotal = 0;
          durationCount = 0;
          bounceLt10s = 0;
          visitors = [];
          devices = [];
          countries = [];
          sources = [];
          sections = [];
        };
        let updatedAggs = Array.append(currentAggs, [newAgg]);
        Map.set(aggsByResumeId, Map.thash, resumeId, updatedAggs);
        (updatedAggs.size() - 1, updatedAggs);
      };
    };
  };

  func pushRaw(ev : RawEvent) {
    let currentRaws = switch (Map.get(rawsByResumeId, Map.thash, ev.resumeId)) {
      case (?raws) raws;
      case null [];
    };

    let appended = Array.append(currentRaws, [ev]);
    let updatedRaws = if (appended.size() > RAW_CAP) Array.tabulate<RawEvent>(RAW_CAP, func(i : Nat) : RawEvent { appended[i + 1] }) else appended;
    Map.set(rawsByResumeId, Map.thash, ev.resumeId, updatedRaws);
  };

  // ========= API Klien =========

  public shared func clientTrack(e : T.AnalyticsEventInput) : async T.Response<Bool> {
    let rid = e.visitor;
    let d = dayStart(e.ts);
    let (idx, aggs) = ensureAgg(e.resumeId, d);
    var row = aggs[idx];

    let country = switch (e.country) { case (null) ""; case (?c) c };
    let source = switch (e.source) { case (null) "Direct"; case (?s) s };
    let section = e.section;

    switch (e.event) {
      case (#VIEW) {
        row := {
          row with
          views = row.views + 1;
          durationMsTotal = row.durationMsTotal + (if (e.durationMs > 0) e.durationMs else 0);
          durationCount = row.durationCount + (if (e.durationMs > 0) 1 else 0);
          bounceLt10s = row.bounceLt10s + (if (e.durationMs > 0 and e.durationMs < 10000) 1 else 0);
          devices = incKV(row.devices, e.device);
          countries = if (country == "") row.countries else incKV(row.countries, country);
          sources = if (source == "") row.sources else incKV(row.sources, source);
        };
      };
      case (#SHARE) { row := { row with shares = row.shares + 1 } };
      case (#DOWNLOAD) { row := { row with downloads = row.downloads + 1 } };
      case (#SECTION_VIEW) {
        let sec = switch (section) { case (null) "Unknown"; case (?s) s };
        row := {
          row with sections = incKV2(row.sections, sec, 1, e.durationMs)
        };
      };
    };

    var seen = false;
    for (v in row.visitors.vals()) { if (v == rid) { seen := true } };
    if (not seen) {
      row := { row with visitors = Array.append(row.visitors, [rid]) };
    };

    // FIX: Mengganti Array.replace dengan Array.tabulate karena array immutable
    let updatedAggs = Array.tabulate(
      aggs.size(),
      func(i : Nat) : DailyAgg {
        if (i == idx) {
          row;
        } else {
          aggs[i];
        };
      },
    );
    Map.set(aggsByResumeId, Map.thash, e.resumeId, updatedAggs);

    pushRaw({
      resumeId = e.resumeId;
      event = e.event;
      visitor = rid;
      ts = e.ts;
      durationMs = e.durationMs;
      device = e.device;
      country = country;
      source = source;
      section = section;
    });

    return #ok({ data = true; message = "ok" });
  };

  private func getAggsByResumeId(resumeId : Text) : [DailyAgg] {
    switch (Map.get(aggsByResumeId, Map.thash, resumeId)) {
      case (?aggs) aggs;
      case null [];
    };
  };

  public query func clientGetOverview(resumeId : Text, range : T.TimeRange) : async T.OverviewResponse {
    let days = rangeDays(range);
    // FIX: Menggunakan pembagian langsung, tidak perlu Nat.fromInt atau Int.abs
    let nowS : Nat = NatCore.fromInt(Time.now());
    let fromDay = dayStart(nowS - (days - 1) * 86400);

    let aggs = getAggsByResumeId(resumeId);

    var totalViews : Nat = 0;
    var shareCount : Nat = 0;
    var downloadCount : Nat = 0;
    var durTotal : Nat = 0;
    var durCount : Nat = 0;
    var bounceLt10s : Nat = 0;
    let uniq = HashMap.HashMap<Text, Bool>(32, Text.equal, Text.hash);

    for (r in aggs.vals()) {
      if (r.dayStart >= fromDay) {
        totalViews += r.views;
        shareCount += r.shares;
        downloadCount += r.downloads;
        durTotal += r.durationMsTotal;
        durCount += r.durationCount;
        bounceLt10s += r.bounceLt10s;
        for (v in r.visitors.vals()) { uniq.put(v, true) };
      };
    };

    let avgMs : Nat = if (durCount == 0) 0 else durTotal / durCount;
    let den = if (durCount == 0) 1 else durCount;
    let bouncePct = NatBase.min(100, (bounceLt10s * 100) / den);

    return #ok({
      data = {
        totalViews = totalViews;
        uniqueVisitors = NatCore.fromInt(uniq.size());
        avgViewDurationMs = avgMs;
        bounceRatePct = bouncePct;
        shareCount = shareCount;
        downloadCount = downloadCount;
      };
      message = "ok";
    });
  };

  public query func clientGetViews(resumeId : Text, range : T.TimeRange) : async T.ViewsResponse {
    let days = rangeDays(range);
    // FIX: Menggunakan pembagian langsung
    let nowS : Nat = NatCore.fromInt(Time.now());
    let start = dayStart(nowS - (days - 1) * 86400);

    let aggs = getAggsByResumeId(resumeId);

    var out : [T.ViewsPoint] = [];
    var i : Nat = 0;
    while (i < days) {
      let d = start + i * 86400;
      var rowOpt : ?DailyAgg = null;
      for (r in aggs.vals()) {
        if (r.dayStart == d) { rowOpt := ?r };
      };

      switch (rowOpt) {
        case (?row) {
          let avgSec = if (row.durationCount == 0) 0 else (row.durationMsTotal / row.durationCount) / 1000;
          out := Array.append(out, [{ date = ymdFromUnix(d); views = row.views; visitors = NatCore.fromInt(row.visitors.size()); durationSecAvg = avgSec }]);
        };
        case null {
          out := Array.append(out, [{ date = ymdFromUnix(d); views = 0; visitors = 0; durationSecAvg = 0 }]);
        };
      };

      i += 1;
    };
    return #ok({ data = out; message = "ok" });
  };

  public query func clientGetDevices(resumeId : Text, range : T.TimeRange) : async T.DevicesResponse {
    let days = rangeDays(range);
    // FIX: Menggunakan pembagian langsung
    let nowS : Nat = NatCore.fromInt(Time.now()) / 1_000_000_000;
    let fromDay = dayStart(nowS - (days - 1) * 86400);

    let aggs = getAggsByResumeId(resumeId);

    var totals : [(Text, Nat)] = [];
    var all : Nat = 0;

    for (r in aggs.vals()) {
      if (r.dayStart >= fromDay) {
        for (p in r.devices.vals()) {
          totals := addKV(totals, p.0, p.1);
          all += p.1;
        };
      };
    };

    // FIX: Menggunakan Array.sort untuk mengurutkan
    var sortedTotals = Array.sort<(Text, Nat)>(totals, func(a, b) { NatBase.compare(b.1, a.1) });

    var out : [T.DeviceItem] = [];
    let denom = if (all == 0) 1 else all;
    for (p in sortedTotals.vals()) {
      // Menggunakan array yang sudah diurutkan
      let pct = (p.1 * 100) / denom;
      out := Array.append(out, [{ name = p.0; value = pct; color = null }]);
    };
    return #ok({ data = out; message = "ok" });
  };

  public query func clientGetLocations(resumeId : Text, range : T.TimeRange) : async T.LocationsResponse {
    let days = rangeDays(range);
    // FIX: Menggunakan pembagian langsung
    let nowS : Nat = NatCore.fromInt(Time.now());
    let fromDay = dayStart(nowS - (days - 1) * 86400);

    let aggs = getAggsByResumeId(resumeId);

    var totals : [(Text, Nat)] = [];
    var all : Nat = 0;

    for (r in aggs.vals()) {
      if (r.dayStart >= fromDay) {
        for (p in r.countries.vals()) {
          totals := addKV(totals, p.0, p.1);
          all += p.1;
        };
      };
    };

    // FIX: Menggunakan Array.sort untuk mengurutkan
    var sortedTotals = Array.sort<(Text, Nat)>(totals, func(a, b) { NatBase.compare(b.1, a.1) });

    let denom = if (all == 0) 1 else all;
    var out : [T.LocationItem] = [];
    for (p in sortedTotals.vals()) {
      // Menggunakan array yang sudah diurutkan
      out := Array.append(out, [{ country = if (p.0 == "") "Unknown" else p.0; views = p.1; percentage = (p.1 * 100) / denom }]);
    };
    return #ok({ data = out; message = "ok" });
  };

  public query func clientGetSources(resumeId : Text, range : T.TimeRange) : async T.SourcesResponse {
    let days = rangeDays(range);
    // FIX: Menggunakan pembagian langsung
    let nowS : Nat = NatCore.fromInt(Time.now());
    let fromDay = dayStart(nowS - (days - 1) * 86400);

    let aggs = getAggsByResumeId(resumeId);

    var totals : [(Text, Nat)] = [];
    var all : Nat = 0;

    for (r in aggs.vals()) {
      if (r.dayStart >= fromDay) {
        for (p in r.sources.vals()) {
          totals := addKV(totals, p.0, p.1);
          all += p.1;
        };
      };
    };

    let denom = if (all == 0) 1 else all;
    var out : [T.TrafficSourceItem] = [];
    for (p in totals.vals()) {
      let src = if (p.0 == "" or p.0 == "Direct") "Direct" else p.0;
      out := Array.append(out, [{ source = src; views = p.1; percentage = (p.1 * 100) / denom }]);
    };
    return #ok({ data = out; message = "ok" });
  };

  public query func clientGetSections(resumeId : Text, range : T.TimeRange) : async T.SectionsResponse {
    let days = rangeDays(range);
    // FIX: Menggunakan pembagian langsung
    let nowS : Nat = NatCore.fromInt(Time.now());
    let fromDay = dayStart(nowS - (days - 1) * 86400);

    let aggs = getAggsByResumeId(resumeId);

    var totals : [(Text, (Nat, Nat))] = [];

    func addSec(arr : [(Text, (Nat, Nat))], key : Text, addC : Nat, addD : Nat) : [(Text, (Nat, Nat))] {
      var found = false;
      let out = Array.map<(Text, (Nat, Nat)), (Text, (Nat, Nat))>(
        arr,
        func(p) {
          if (p.0 == key) { found := true; (p.0, (p.1.0 + addC, p.1.1 + addD)) } else p;
        },
      );
      if (found) out else Array.append(out, [(key, (addC, addD))]);
    };

    for (r in aggs.vals()) {
      if (r.dayStart >= fromDay) {
        for (p in r.sections.vals()) {
          totals := addSec(totals, p.0, p.1.0, p.1.1);
        };
      };
    };

    func toViewTime(ms : Nat) : Text {
      if (ms == 0) "0s" else {
        let s = ms / 1000;
        if (s < 60) NatBase.toText(s) # "s" else NatCore.toText(s / 60) # "m " # NatCore.toText(s % 60) # "s";
      };
    };
    func engagement(ms : Nat) : Nat {
      let s = ms / 1000;
      let n = (s * 100) / 30;
      if (n > 100) 100 else n;
    };

    var out : [T.SectionPerfItem] = [];
    for (p in totals.vals()) {
      let c = p.1.0;
      let d = p.1.1;
      let avg = if (c == 0) 0 else d / c;
      out := Array.append(out, [{ section = p.0; viewTime = toViewTime(avg); engagement = engagement(avg) }]);
    };
    return #ok({ data = out; message = "ok" });
  };

  public query func clientGetActivity(resumeId : Text, limit : Nat) : async T.ActivityResponse {
    let raws = switch (Map.get(rawsByResumeId, Map.thash, resumeId)) {
      case (?raws) raws;
      case null [];
    };

    // FIX: Menggunakan Iter.toArray(raws.vals()) untuk mengonversi ke array
    var arr : [RawEvent] = Iter.toArray(raws.vals());

    // FIX: Menggunakan Array.sort untuk mengurutkan array secara efisien
    let sortedArr = Array.sort<RawEvent>(arr, func(a, b) { NatBase.compare(b.ts, a.ts) });

    // FIX: Menggunakan pembagian langsung
    let nowS : Nat = NatCore.fromInt(Time.now());

    func mapAction(e : T.AnalyticsEventType) : Text {
      switch (e) {
        case (#VIEW) "Resume viewed";
        case (#SHARE) "Resume shared";
        case (#DOWNLOAD) "Resume downloaded";
        case (#SECTION_VIEW) "Section viewed";
      };
    };

    var out : [T.ActivityItem] = [];
    var c : Nat = 0;
    // Use a while loop to accumulate up to 'limit' items
    var i : Nat = 0;
    let n = sortedArr.size();
    while (i < n and c < limit) {
      let e = sortedArr[i];
      out := Array.append(out, [{
        action = mapAction(e.event);
        location = if (e.country == "") "Unknown" else e.country;
        timeAgo = toAgo(nowS, e.ts);
        device = if (e.device == "") "Desktop" else e.device;
      }]);
      c += 1;
      i += 1;
    };

    return #ok({ data = out; message = "ok" });
  };

};
