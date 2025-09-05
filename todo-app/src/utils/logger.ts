type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
}

class Logger {
  private isDevelopment = __DEV__;
  private isDebugEnabled = process.env.DEBUG_ENABLED === 'true';

  private log(level: LogLevel, message: string, data?: any): void {
    if (this.isDevelopment || level === 'error') {
      const logEntry: LogEntry = {
        level,
        message,
        timestamp: new Date(),
        data,
      };

      // In production, only log errors
      // In development, log everything
      if (!this.isDevelopment && level !== 'error') {
        return;
      }

      // Use appropriate console method based on level
      switch (level) {
        case 'error':
          if (this.isDevelopment) {
            console.error(`[${level.toUpperCase()}]`, message, data || '');
          }
          // In production, you could send errors to a service like Sentry
          break;
        case 'warn':
          if (this.isDevelopment) {
            console.warn(`[${level.toUpperCase()}]`, message, data || '');
          }
          break;
        case 'info':
          if (this.isDevelopment) {
            console.info(`[${level.toUpperCase()}]`, message, data || '');
          }
          break;
        case 'debug':
          if (this.isDevelopment && this.isDebugEnabled) {
            console.log(`[${level.toUpperCase()}]`, message, data || '');
          }
          break;
      }
    }
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | any): void {
    this.log('error', message, error);
  }
}

export const logger = new Logger();