
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';
import { ExportOptions } from './ExportOptions';
import { ImportData } from './ImportData';
import { VersionHistory } from './VersionHistory';

export const DataManagement: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>Data Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ExportOptions />
        <ImportData />
        <VersionHistory />
      </CardContent>
    </Card>
  );
};
