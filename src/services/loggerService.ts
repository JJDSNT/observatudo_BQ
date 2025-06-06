// src/services/loggerService.ts

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  stackTrace?: string;
}

class LoggerServiceClass {
  private logs: LogEntry[] = [];
  private maxEntries = 1000;
  private enabled = true;
  private logLevel: LogLevel = 'info';
  private lastError: LogEntry | null = null;

  private readonly LEVEL_PRIORITY: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  configure(config: { enabled: boolean; logLevel: LogLevel; maxEntries: number }) {
    this.enabled = config.enabled;
    this.logLevel = config.logLevel;
    this.maxEntries = config.maxEntries;
  }

  log(level: LogLevel, category: string, message: string, data?: any): void {
    if (!this.enabled || this.LEVEL_PRIORITY[level] < this.LEVEL_PRIORITY[this.logLevel]) {
      return;
    }

    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
    };

    if (level === 'error') {
      entry.stackTrace = new Error().stack;
    }

    this.logs.push(entry);
    this.trimLogs();

    // console output
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[${category}] ${message}`, data || '');
  }

  getLogs(level?: LogLevel, category?: string): LogEntry[] {
    return this.logs.filter(log =>
      (!level || log.level === level) &&
      (!category || log.category === category)
    );
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  private trimLogs(): void {
    if (this.logs.length <= this.maxEntries) return;

    const errorLogs = this.logs.filter(log => log.level === 'error').slice(-50);
    const otherLogs = this.logs.filter(log => log.level !== 'error').slice(-(this.maxEntries - errorLogs.length));
    this.logs = [...errorLogs, ...otherLogs].sort((a, b) => a.timestamp - b.timestamp);
  }

  setError(message: string, category = 'SYSTEM', data?: any): void {
    const errorLog: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level: 'error',
      category,
      message,
      data,
      stackTrace: new Error().stack
    };

    this.logs.push(errorLog);
    this.lastError = errorLog;
    this.trimLogs();
    console.error(`[${category}] ${message}`, data || '');
  }

  getLastError(): LogEntry | null {
    return this.lastError;
  }

  clearLastError(): void {
    this.lastError = null;
  }
}

export const LoggerService = new LoggerServiceClass();
