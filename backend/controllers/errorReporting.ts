import { Request, Response } from 'express';

interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
}

export const reportError = async (req: Request, res: Response) => {
  try {
    const errorReport: ErrorReport = req.body;
    
    // Add user ID if available from auth middleware
    const userId = (req as any).userId;
    if (userId) {
      errorReport.userId = userId;
    }

    // Log error to console (in production, you'd send to external service)
    console.error('Frontend Error Report:', {
      ...errorReport,
      severity: 'error',
      source: 'frontend'
    });

    // In production, send to external error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, DataDog, etc.
      await sendToErrorTrackingService(errorReport);
    }

    // Store in database for analytics (optional)
    await storeErrorReport(errorReport);

    res.json({ success: true, message: 'Error reported successfully' });
  } catch (error) {
    console.error('Failed to process error report:', error);
    res.status(500).json({ error: 'Failed to process error report' });
  }
};

async function sendToErrorTrackingService(errorReport: ErrorReport) {
  // Example integration with external service
  try {
    // Replace with your error tracking service API
    // await fetch('https://api.sentry.io/api/...', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.SENTRY_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(errorReport)
    // });
    
    console.log('Would send to external error tracking service:', errorReport.message);
  } catch (error) {
    console.error('Failed to send to external error tracking service:', error);
  }
}

async function storeErrorReport(errorReport: ErrorReport) {
  // Store error in database for internal analytics
  try {
    // Example: Store in Supabase or your database
    // await supabase
    //   .from('error_reports')
    //   .insert({
    //     message: errorReport.message,
    //     stack: errorReport.stack,
    //     component_stack: errorReport.componentStack,
    //     timestamp: errorReport.timestamp,
    //     user_agent: errorReport.userAgent,
    //     url: errorReport.url,
    //     user_id: errorReport.userId
    //   });
    
    console.log('Would store error report in database:', errorReport.message);
  } catch (error) {
    console.error('Failed to store error report:', error);
  }
}

export const getErrorStats = async (req: Request, res: Response) => {
  try {
    // Return error statistics for monitoring dashboard
    const stats = {
      totalErrors: 0, // Get from database
      errorsByDay: [], // Get from database
      topErrors: [], // Get from database
      errorsByBrowser: [], // Get from database
      lastUpdated: new Date().toISOString()
    };

    res.json(stats);
  } catch (error) {
    console.error('Failed to get error stats:', error);
    res.status(500).json({ error: 'Failed to get error statistics' });
  }
};
