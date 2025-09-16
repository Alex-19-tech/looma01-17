import { useState } from "react";
import { MetricsFilterState } from "@/components/MetricsFilters";
import { DateRange } from "@/components/MetricsDateFilter";
import { format } from "date-fns";

interface ExportData {
  metrics: any[];
  cohortData: any[];
  conversionData: any[];
}

interface ExportOptions {
  includeCharts?: boolean;
  includeMetadata?: boolean;
  format?: 'csv' | 'xlsx' | 'json';
}

export function useMetricsExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = async (
    data: ExportData,
    dateRange: DateRange,
    filters: MetricsFilterState,
    options: ExportOptions = {}
  ) => {
    setIsExporting(true);
    
    try {
      // Generate comprehensive CSV content
      const csvContent = generateEnhancedCSVContent(data, dateRange, filters, options);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `preflix-metrics-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('CSV Export failed:', error);
      return { success: false, error: 'Failed to export CSV data' };
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async (
    data: ExportData,
    dateRange: DateRange,
    filters: MetricsFilterState,
    options: ExportOptions = {}
  ) => {
    setIsExporting(true);
    
    try {
      // Create comprehensive HTML report
      const htmlContent = generateEnhancedHTMLReport(data, dateRange, filters, options);
      
      // Create a new window with the report
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load, then trigger print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      } else {
        throw new Error('Unable to open print window. Please check your popup blocker settings.');
      }
      
      return { success: true };
    } catch (error) {
      console.error('PDF export failed:', error);
      return { success: false, error: error.message || 'Failed to export PDF' };
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = async (
    data: ExportData,
    dateRange: DateRange,
    filters: MetricsFilterState
  ) => {
    setIsExporting(true);
    
    try {
      const exportData = {
        exportInfo: {
          timestamp: new Date().toISOString(),
          dateRange: {
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString()
          },
          filters: filters,
          totalRecords: {
            metrics: data.metrics.length,
            cohortData: data.cohortData.length,
            conversionData: data.conversionData.length
          }
        },
        data: data
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `preflix-metrics-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('JSON export failed:', error);
      return { success: false, error: 'Failed to export JSON data' };
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToCSV,
    exportToPDF,
    exportToJSON,
    isExporting
  };
}

function generateEnhancedCSVContent(
  data: ExportData,
  dateRange: DateRange,
  filters: MetricsFilterState,
  options: ExportOptions
): string {
  let csv = `Preflix Metrics Export\n`;
  csv += `Generated: ${format(new Date(), 'MMM d, yyyy HH:mm:ss')}\n`;
  csv += `Date Range: ${format(dateRange.from, 'MMM d, yyyy')} to ${format(dateRange.to, 'MMM d, yyyy')}\n`;
  csv += `Total Records: ${data.metrics.length + data.cohortData.length + data.conversionData.length}\n\n`;
  
  // Add filter information if any filters are applied
  if (Object.keys(filters).some(key => filters[key as keyof MetricsFilterState])) {
    csv += "Applied Filters:\n";
    if (filters.cohort && filters.cohort !== 'all') csv += `Cohort: ${filters.cohort}\n`;
    if (filters.planType && filters.planType !== 'all') csv += `Plan Type: ${filters.planType}\n`;
    if (filters.templateCategory && filters.templateCategory !== 'all') csv += `Template Category: ${filters.templateCategory}\n`;
    csv += "\n";
  }

  // Metrics data with enhanced formatting
  csv += "=== METRICS DATA ===\n";
  csv += "Date,Time,Metric Type,Value,Unit,Metadata\n";
  data.metrics.forEach(metric => {
    const date = new Date(metric.timestamp);
    const metadataStr = options.includeMetadata && metric.metadata 
      ? JSON.stringify(metric.metadata).replace(/,/g, ';') 
      : '';
    const unit = getMetricUnit(metric.metric_type);
    csv += `${format(date, 'yyyy-MM-dd')},${format(date, 'HH:mm:ss')},${metric.metric_type},${metric.value},${unit},"${metadataStr}"\n`;
  });
  
  // Summary statistics
  csv += "\n=== METRICS SUMMARY ===\n";
  const metricTypes = [...new Set(data.metrics.map(m => m.metric_type))];
  csv += "Metric Type,Count,Average,Min,Max,Latest Value\n";
  metricTypes.forEach(type => {
    const typeMetrics = data.metrics.filter(m => m.metric_type === type);
    const values = typeMetrics.map(m => m.value);
    const avg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : '0';
    const min = values.length > 0 ? Math.min(...values) : 0;
    const max = values.length > 0 ? Math.max(...values) : 0;
    const latest = typeMetrics.length > 0 ? typeMetrics[typeMetrics.length - 1].value : 0;
    csv += `${type},${typeMetrics.length},${avg},${min},${max},${latest}\n`;
  });
  
  // Cohort retention data
  csv += "\n=== COHORT RETENTION ===\n";
  csv += "Cohort Month,Period Number,Retention Rate (%),Users Count,Date Added\n";
  data.cohortData.forEach(cohort => {
    csv += `${cohort.cohort_month},${cohort.period_number},${cohort.retention_rate},${cohort.users_count},${cohort.created_at || 'N/A'}\n`;
  });
  
  // Conversion funnel data
  csv += "\n=== CONVERSION FUNNEL ===\n";
  csv += "Stage,Stage Order,Users Count,Conversion Rate (%),Timestamp\n";
  data.conversionData.forEach(conversion => {
    csv += `${conversion.stage},${conversion.stage_order},${conversion.users_count},${conversion.conversion_rate},${conversion.timestamp || 'N/A'}\n`;
  });

  return csv;
}

function getMetricUnit(metricType: string): string {
  switch (metricType) {
    case 'time_to_optimized': return 'seconds';
    case 'churn_rate': return '%';
    case 'growth_rate': return '%';
    case 'conversion_rate': return '%';
    case 'user_satisfaction': return '/5';
    case 'api_response_time': return 'ms';
    default: return '';
  }
}

function generateEnhancedHTMLReport(
  data: ExportData,
  dateRange: DateRange,
  filters: MetricsFilterState,
  options: ExportOptions
): string {
  const filterInfo = Object.keys(filters).some(key => filters[key as keyof MetricsFilterState])
    ? `<div class="filter-info">
        <h3>Applied Filters</h3>
        <ul>
          ${filters.cohort && filters.cohort !== 'all' ? `<li><strong>Cohort:</strong> ${filters.cohort}</li>` : ''}
          ${filters.planType && filters.planType !== 'all' ? `<li><strong>Plan Type:</strong> ${filters.planType}</li>` : ''}
          ${filters.templateCategory && filters.templateCategory !== 'all' ? `<li><strong>Template Category:</strong> ${filters.templateCategory}</li>` : ''}
        </ul>
       </div>`
    : '';

  const metricsStats = generateMetricsStats(data.metrics);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preflix Metrics Report - ${format(new Date(), 'MMM d, yyyy')}</title>
      <style>
        * { box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6;
          margin: 0;
          padding: 40px; 
          color: #1f2937; 
          background: #ffffff;
        }
        .header { 
          background: linear-gradient(135deg, #0ea5e9, #06b6d4);
          color: white; 
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          text-align: center;
        }
        h1 { 
          margin: 0;
          font-size: 2.5rem;
          font-weight: 700;
        }
        .subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          margin: 10px 0 0 0;
        }
        h2 { 
          color: #0ea5e9; 
          margin: 40px 0 20px 0;
          font-size: 1.5rem;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
        }
        h3 {
          color: #374151;
          margin: 25px 0 15px 0;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        th, td { 
          border: 1px solid #e5e7eb; 
          padding: 12px 16px; 
          text-align: left; 
        }
        th { 
          background: #f9fafb; 
          font-weight: 600;
          color: #374151;
        }
        tr:nth-child(even) {
          background: #f9fafb;
        }
        tr:hover {
          background: #f3f4f6;
        }
        .summary { 
          background: #f0f9ff; 
          padding: 20px; 
          border-radius: 12px; 
          margin: 25px 0;
          border-left: 4px solid #0ea5e9;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }
        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #0ea5e9;
        }
        .stat-label {
          color: #6b7280;
          margin-top: 5px;
        }
        .filter-info {
          background: #fef3c7;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #f59e0b;
        }
        .no-data {
          text-align: center;
          color: #6b7280;
          font-style: italic;
          padding: 40px;
        }
        @media print {
          body { padding: 20px; font-size: 12px; }
          .header { background: #0ea5e9 !important; }
          .no-print { display: none !important; }
          table { font-size: 11px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          body { padding: 20px; }
          h1 { font-size: 2rem; }
          .stats-grid { grid-template-columns: 1fr; }
          table { font-size: 14px; }
          th, td { padding: 8px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Preflix Metrics Report</h1>
        <div class="subtitle">
          ${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')} | 
          Generated on ${format(new Date(), 'MMM d, yyyy HH:mm')}
        </div>
      </div>
      
      <div class="summary">
        <h3>Report Summary</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${data.metrics.length}</div>
            <div class="stat-label">Total Metrics</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${data.cohortData.length}</div>
            <div class="stat-label">Cohort Records</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${data.conversionData.length}</div>
            <div class="stat-label">Conversion Stages</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))}</div>
            <div class="stat-label">Days Analyzed</div>
          </div>
        </div>
      </div>

      ${filterInfo}

      ${metricsStats}
      
      <h2>📊 Detailed Metrics Data</h2>
      ${data.metrics.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Metric Type</th>
              <th>Value</th>
              <th>Unit</th>
              ${options.includeMetadata ? '<th>Metadata</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${data.metrics.slice(0, 100).map(metric => {
              const date = new Date(metric.timestamp);
              const unit = getMetricUnit(metric.metric_type);
              const metadata = options.includeMetadata && metric.metadata
                ? JSON.stringify(metric.metadata, null, 2)
                : '';
              return `<tr>
                <td>${format(date, 'MMM d, yyyy HH:mm')}</td>
                <td>${metric.metric_type}</td>
                <td>${metric.value}</td>
                <td>${unit}</td>
                ${options.includeMetadata ? `<td><pre style="margin:0;font-size:11px;">${metadata}</pre></td>` : ''}
              </tr>`;
            }).join('')}
            ${data.metrics.length > 100 ? `<tr><td colspan="${options.includeMetadata ? '5' : '4'}" class="no-data">... and ${data.metrics.length - 100} more records</td></tr>` : ''}
          </tbody>
        </table>
      ` : '<div class="no-data">No metrics data available for the selected period.</div>'}
      
      <h2>👥 Cohort Retention Analysis</h2>
      ${data.cohortData.length > 0 ? `
        <table>
          <thead>
            <tr><th>Cohort Month</th><th>Period</th><th>Retention Rate</th><th>Users Count</th></tr>
          </thead>
          <tbody>
            ${data.cohortData.map(cohort => 
              `<tr>
                <td>${cohort.cohort_month}</td>
                <td>Period ${cohort.period_number}</td>
                <td>${cohort.retention_rate}%</td>
                <td>${cohort.users_count.toLocaleString()}</td>
              </tr>`
            ).join('')}
          </tbody>
        </table>
      ` : '<div class="no-data">No cohort retention data available.</div>'}
      
      <h2>🎯 Conversion Funnel Analysis</h2>
      ${data.conversionData.length > 0 ? `
        <table>
          <thead>
            <tr><th>Stage</th><th>Users Count</th><th>Conversion Rate</th><th>Drop-off</th></tr>
          </thead>
          <tbody>
            ${data.conversionData.map((conversion, index) => {
              const prevStage = index > 0 ? data.conversionData[index - 1] : null;
              const dropOff = prevStage ? 
                `${((prevStage.users_count - conversion.users_count) / prevStage.users_count * 100).toFixed(1)}%` : 
                'N/A';
              return `<tr>
                <td><strong>${conversion.stage}</strong></td>
                <td>${conversion.users_count.toLocaleString()}</td>
                <td>${conversion.conversion_rate}%</td>
                <td>${dropOff}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      ` : '<div class="no-data">No conversion funnel data available.</div>'}

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; text-align: center;">
        <p>This report was generated automatically by Preflix Analytics Dashboard.</p>
        <p>For questions about this data, please contact your system administrator.</p>
      </div>
    </body>
    </html>
  `;
}

function generateMetricsStats(metrics: any[]): string {
  if (metrics.length === 0) return '';

  const metricTypes = [...new Set(metrics.map(m => m.metric_type))];
  
  return `
    <h2>📈 Metrics Summary Statistics</h2>
    <table>
      <thead>
        <tr>
          <th>Metric Type</th>
          <th>Total Records</th>
          <th>Average Value</th>
          <th>Minimum</th>
          <th>Maximum</th>
          <th>Latest Value</th>
          <th>Trend</th>
        </tr>
      </thead>
      <tbody>
        ${metricTypes.map(type => {
          const typeMetrics = metrics.filter(m => m.metric_type === type).sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          const values = typeMetrics.map(m => m.value);
          const avg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : '0';
          const min = values.length > 0 ? Math.min(...values).toFixed(2) : '0';
          const max = values.length > 0 ? Math.max(...values).toFixed(2) : '0';
          const latest = typeMetrics.length > 0 ? typeMetrics[typeMetrics.length - 1].value.toFixed(2) : '0';
          
          // Calculate trend (comparing first and last values)
          const trend = typeMetrics.length >= 2 ? 
            (typeMetrics[typeMetrics.length - 1].value > typeMetrics[0].value ? '📈 Up' : 
             typeMetrics[typeMetrics.length - 1].value < typeMetrics[0].value ? '📉 Down' : '➡️ Stable') : 
            '➡️ N/A';
          
          return `<tr>
            <td><strong>${type}</strong></td>
            <td>${typeMetrics.length}</td>
            <td>${avg}</td>
            <td>${min}</td>
            <td>${max}</td>
            <td>${latest}</td>
            <td>${trend}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;
}