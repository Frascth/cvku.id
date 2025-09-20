/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, MouseEvent, TouchEvent } from "react";
import { Header } from "../components/Header";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  X,
  Check,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
} from "lucide-react";

// New interfaces for more structured data
interface Experience {
  year: string;
  title: string;
}

interface Education {
  year: string;
  degree: string;
}

interface Resume {
  id: string;
  name: string;
  summary: string;
  contact: {
    email: string;
    phone: string;
  };
  skills: string[];
  experience: Experience[];
  education: Education[];
}

// Data generator for 25 unique resumes
const generateDummyData = (count: number): Resume[] => {
  const firstNames = [
    "Emily",
    "Jacob",
    "Sophia",
    "Michael",
    "Isabella",
    "Ethan",
    "Olivia",
    "Daniel",
    "Ava",
    "Matthew",
    "Liam",
    "Noah",
    "Emma",
    "Aiden",
    "Chloe",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
  ];
  const summaries = [
    "A results-driven professional with a proven track record of success.",
    "Innovative problem-solver with a passion for developing cutting-edge solutions.",
    "Highly motivated and detail-oriented individual seeking to leverage skills in a challenging role.",
    "Creative thinker with expertise in user-centered design and product development.",
    "Data-driven analyst with a talent for uncovering insights and driving business growth.",
  ];
  const skills = [
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "GraphQL",
    "Figma",
    "Python",
    "Docker",
    "AWS",
    "CI/CD",
    "Prototyping",
    "User Research",
  ];
  const jobTitles = [
    "Software Engineer",
    "Product Manager",
    "UX/UI Designer",
    "Data Scientist",
    "Lead Developer",
    "Frontend Engineer",
    "Cloud Architect",
  ];
  const degrees = [
    "M.S. in Computer Science",
    "B.A. in Graphic Design",
    "Ph.D. in Data Science",
    "B.S. in Software Engineering",
    "MBA",
  ];
  const years = [
    "2020 - Present",
    "2018 - 2020",
    "2016 - 2018",
    "2021 - Present",
    "2019 - 2021",
  ];

  const resumes: Resume[] = [];

  const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
  const shuffleArray = (arr: any[]) => [...arr].sort(() => 0.5 - Math.random());

  for (let i = 1; i <= count; i++) {
    const firstName = getRandom(firstNames);
    const lastName = getRandom(lastNames);
    const name = `${firstName} ${lastName}`;
    const shuffledSkills = shuffleArray(skills);

    resumes.push({
      id: i.toString(),
      name,
      summary: getRandom(summaries),
      contact: {
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `(${Math.floor(200 + Math.random() * 799)})-555-${Math.floor(
          1000 + Math.random() * 9000
        )}`,
      },
      skills: shuffledSkills.slice(0, 5 + Math.floor(Math.random() * 3)), // 5-7 random skills
      experience: [
        { year: getRandom(years), title: getRandom(jobTitles) },
        { year: getRandom(years), title: getRandom(jobTitles) },
        { year: getRandom(years), title: getRandom(jobTitles) },
      ],
      education: [
        { year: "2012 - 2016", degree: getRandom(degrees) },
        { year: "2010 - 2012", degree: "Associate Degree" },
      ],
    });
  }
  return resumes;
};

const fetchResumes = async (): Promise<Resume[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateDummyData(25));
    }, 1);
  });
};

const Spark = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [cardTransition, setCardTransition] = useState(
    "transform 0.3s ease-out"
  );

  useEffect(() => {
    const getResumes = async () => {
      setIsLoading(true);
      const data = await fetchResumes();
      setResumes(data);
      setIsLoading(false);
    };
    getResumes();
  }, []);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    if (isDragging) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalStyle;
    }
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isDragging]);

  const handleSwipe = (direction: "left" | "right") => {
    if (currentIndex >= resumes.length) return;
    setCardTransition("transform 0.3s ease-out");
    const exitX =
      direction === "right" ? window.innerWidth : -window.innerWidth;
    setPosition({ x: exitX, y: position.y });
    setTimeout(() => {
      setCardTransition("none");
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setPosition({ x: 0, y: 0 });
      setTimeout(() => {
        setCardTransition("transform 0.3s ease-out");
      }, 50);
    }, 300);
  };

  const handleDragStart = (e: MouseEvent | TouchEvent) => {
    setCardTransition("none");
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setStartPos({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setPosition({ x: clientX - startPos.x, y: clientY - startPos.y });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 100;
    if (position.x > threshold) {
      handleSwipe("right");
    } else if (position.x < -threshold) {
      handleSwipe("left");
    } else {
      setCardTransition("transform 0.3s ease-out");
      setPosition({ x: 0, y: 0 });
    }
  };

  const rotation = position.x / 20;
  const overlayOpacity = Math.min(Math.abs(position.x) / 100, 1);
  const noMoreResumes = currentIndex >= resumes.length;
  const cardsToRender = resumes.slice(currentIndex, currentIndex + 2).reverse();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading resumes...</span>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden"
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
      onTouchCancel={handleDragEnd}
    >
      <Header />
      <div className="p-4 w-full max-w-sm sm:max-w-md md:max-w-lg relative flex-grow flex flex-col justify-center items-center mx-auto">
        <div className="relative w-full aspect-[10/14] max-h-[85vh]">
          {noMoreResumes ? (
            <div className="flex justify-center items-center h-full bg-gray-50 rounded-xl shadow-md">
              <p className="text-gray-500">All out of resumes for now. 👋</p>
            </div>
          ) : (
            cardsToRender.map((resume, index) => {
              const isTopCard = index === cardsToRender.length - 1;
              const stackOffset = cardsToRender.length - 1 - index;
              let transform = "none",
                currentTransition = "opacity 0.3s ease-out",
                opacity = stackOffset > 1 ? 0 : 1;
              if (isTopCard) {
                transform = `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`;
                currentTransition = cardTransition;
                opacity = 1;
              }

              let cardClasses =
                "absolute inset-0 bg-white rounded-xl shadow-lg p-6 sm:p-8 flex flex-col will-change-transform";
              if (isTopCard) {
                cardClasses += " touch-action-none active:cursor-grabbing";
              }

              return (
                <div
                  key={resume.id}
                  className={cardClasses}
                  style={{
                    transform,
                    zIndex: index,
                    opacity,
                    transition: currentTransition,
                    cursor: isTopCard ? "grab" : "auto",
                  }}
                  {...(isTopCard && {
                    onMouseDown: handleDragStart,
                    onTouchStart: handleDragStart,
                  })}
                >
                  {isTopCard && position.x !== 0 && (
                    <div
                      className="absolute inset-0 flex items-center justify-center font-bold text-6xl pointer-events-none z-10"
                      style={{ opacity: overlayOpacity }}
                    >
                      {position.x > 0 ? (
                        <div className="text-green-500 border-4 border-green-500 rounded-lg p-4 rotate-[-25deg]">
                          LIKE
                        </div>
                      ) : (
                        <div className="text-red-500 border-4 border-red-500 rounded-lg p-4 rotate-[25deg]">
                          NOPE
                        </div>
                      )}
                    </div>
                  )}
                  <div className="absolute top-4 right-4 text-gray-500 text-sm bg-white/50 rounded-full px-2">
                    {currentIndex + stackOffset + 1} / {resumes.length}
                  </div>

                  <div className="text-center flex-shrink-0">
                    <h2 className="text-2xl sm:text-3xl font-bold text-indigo-600">
                      {resume.name}
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500">
                      {resume.summary}
                    </p>
                    <div className="mt-3 flex justify-center flex-wrap items-center text-xs text-slate-600 gap-x-3 gap-y-1">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 shrink-0 text-indigo-400" />
                        <span>{resume.contact.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 shrink-0 text-indigo-400" />
                        <span>{resume.contact.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 pr-2">
                    <div className="space-y-4 sm:space-y-5">
                      <div className="flex flex-wrap justify-center gap-2">
                        {resume.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="space-y-2 text-xs sm:text-sm">
                        {resume.education.map((edu, i) => (
                          <div key={i} className="flex items-start">
                            {i === 0 && (
                              <GraduationCap className="h-4 w-4 mt-0.5 mr-3 shrink-0 text-indigo-400" />
                            )}
                            {i > 0 && <div className="w-4 mr-3 shrink-0" />}
                            <div className="flex justify-between items-center w-full">
                              <p className="font-semibold text-slate-700">
                                {edu.degree}
                              </p>
                              <p className="text-slate-500 font-medium text-right ml-2">
                                {edu.year}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2 text-xs sm:text-sm">
                        {resume.experience.map((exp, i) => (
                          <div key={i} className="flex items-start">
                            {i === 0 && (
                              <Briefcase className="h-4 w-4 mt-0.5 mr-3 shrink-0 text-indigo-400" />
                            )}
                            {i > 0 && <div className="w-4 mr-3 shrink-0" />}
                            <div className="flex justify-between items-center w-full">
                              <p className="font-semibold text-slate-700">
                                {exp.title}
                              </p>
                              <p className="text-slate-500 font-medium text-right ml-2">
                                {exp.year}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="flex justify-around mt-6 w-full max-w-xs">
          <Button
            className="bg-white hover:bg-red-100 text-red-500 rounded-full h-16 w-16 shadow-lg flex items-center justify-center"
            onClick={() => handleSwipe("left")}
            disabled={noMoreResumes}
          >
            <X size={32} />
          </Button>
          <Button
            className="bg-white hover:bg-green-100 text-green-500 rounded-full h-16 w-16 shadow-lg flex items-center justify-center"
            onClick={() => handleSwipe("right")}
            disabled={noMoreResumes}
          >
            <Check size={32} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Spark;
