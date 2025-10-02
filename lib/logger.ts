/**
 * Structured logging utility
 *
 * Provides consistent logging format across the application with
 * support for different log levels and structured data.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private isDevelopment: boolean
  private isProduction: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.isProduction = process.env.NODE_ENV === 'production'
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    }

    if (context && Object.keys(context).length > 0) {
      entry.context = context
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      }
    }

    return entry
  }

  private output(entry: LogEntry): void {
    if (this.isProduction) {
      // In production, output JSON for log aggregation services
      console.log(JSON.stringify(entry))
    } else {
      // In development, use readable format
      const emoji = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
      }[entry.level]

      console.log(`${emoji} [${entry.level.toUpperCase()}] ${entry.message}`)

      if (entry.context) {
        console.log('Context:', entry.context)
      }

      if (entry.error) {
        console.error('Error:', entry.error)
      }
    }
  }

  /**
   * Debug-level log (only shown in development)
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return
    const entry = this.formatLog('debug', message, context)
    this.output(entry)
  }

  /**
   * Info-level log
   */
  info(message: string, context?: LogContext): void {
    const entry = this.formatLog('info', message, context)
    this.output(entry)
  }

  /**
   * Warning-level log
   */
  warn(message: string, context?: LogContext): void {
    const entry = this.formatLog('warn', message, context)
    this.output(entry)
  }

  /**
   * Error-level log
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const entry = this.formatLog('error', message, context, error)
    this.output(entry)
  }

  /**
   * Log API request
   */
  apiRequest(method: string, url: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${url}`, {
      method,
      url,
      ...context,
    })
  }

  /**
   * Log API response
   */
  apiResponse(method: string, url: string, status: number, context?: LogContext): void {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info'
    const entry = this.formatLog(level, `API Response: ${method} ${url} - ${status}`, {
      method,
      url,
      status,
      ...context,
    })
    this.output(entry)
  }

  /**
   * Log database query
   */
  dbQuery(operation: string, table: string, context?: LogContext): void {
    this.debug(`Database: ${operation} on ${table}`, {
      operation,
      table,
      ...context,
    })
  }

  /**
   * Log authentication event
   */
  auth(event: string, userId?: string, context?: LogContext): void {
    this.info(`Auth: ${event}`, {
      event,
      userId,
      ...context,
    })
  }

  /**
   * Log payment event
   */
  payment(event: string, context?: LogContext): void {
    this.info(`Payment: ${event}`, {
      event,
      ...context,
    })
  }
}

// Export singleton instance
export const logger = new Logger()

// Export for server-side usage
export default logger
