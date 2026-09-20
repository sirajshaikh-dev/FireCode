import React from 'react';
import { CheckCircle2, XCircle, Clock, MemoryStick as Memory } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const SubmissionResults = ({ submission }) => {
  // Parse stringified arrays
  const memoryArr = JSON.parse(submission.memory || '[]');
  const timeArr = JSON.parse(submission.time || '[]');

  // Calculate averages
  const avgMemory = memoryArr
    .map(m => parseFloat(m)) // remove ' KB' using parseFloat
    .reduce((a, b) => a + b, 0) / (memoryArr.length || 1);

  const avgTime = timeArr
    .map(t => parseFloat(t)) // remove ' s' using parseFloat
    .reduce((a, b) => a + b, 0) / (timeArr.length || 1);

  const passedTests = submission.testCases.filter(tc => tc.passed).length;
  const totalTests = submission.testCases.length;
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  const isAccepted = submission.status === 'Accepted';

  return (
    <div className="space-y-6">
      {/* Overall Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Status</h3>
          <div className="mt-1">
            <Badge variant={isAccepted ? "easy" : "hard"} className="text-sm font-bold px-3 py-1">
              {submission.status}
            </Badge>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Success Rate</h3>
          <div className="text-2xl font-bold text-foreground">
            {successRate.toFixed(1)}%
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            Avg. Runtime
          </h3>
          <div className="text-2xl font-bold text-foreground">
            {avgTime.toFixed(3)} s
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Memory className="w-3.5 h-3.5 text-primary" />
            Avg. Memory
          </h3>
          <div className="text-2xl font-bold text-foreground">
            {avgMemory.toFixed(0)} KB
          </div>
        </div>
      </div>

      {/* Test Cases Results Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Test Cases Results</h2>
        </div>
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Expected Output</TableHead>
              <TableHead>Your Output</TableHead>
              <TableHead>Memory</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submission.testCases.map((testCase) => (
              <TableRow key={testCase.id}>
                <TableCell>
                  {testCase.passed ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Passed
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-400 font-medium text-xs">
                      <XCircle className="w-4 h-4 text-rose-400" />
                      Failed
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs">{testCase.expected}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{testCase.stdout || 'null'}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{testCase.memory}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{testCase.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SubmissionResults;