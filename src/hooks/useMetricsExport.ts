import { useState } from "react";
import { MetricsFilterState } from "@/components/MetricsFilters";
import { DateRange } from "@/components/MetricsDateFilter";
import { format } from "date-fns";

interface ExportData {
  metrics: any[];
  cohortData: any[];
  conversionData: any[];
}

export function useMetricsExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = async (
    data: ExportData,
    dateRange: DateRange,
    filters: MetricsFilterState
  ) => {
    setIsExporting(true);
    
    try {
      // Generate CSV content
      const csvContent = generateCSVContent(data, dateRange, filters);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `preflix-metrics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Export failed:', error);
      return { success: false, error: 'Failed to export data' };
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async (
    data: ExportData,
    dateRange: DateRange,
    filters: MetricsFilterState
  ) => {
    setIsExporting(true);
    
    try {
      // For PDF export, we'll create a simplified HTML report
      const htmlContent = generateHTMLReport(data, dateRange, filters);
      
      // Create a new window with the report
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Trigger print dialog
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 100);
      }
      
      return { success: true };
    } catch (error) {
      console.error('PDF export failed:', error);
      return { success: false, error: 'Failed to export PDF' };
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToCSV,
    exportToPDF,
    isExporting
  };
}

function generateCSVContent(
  data: ExportData,
  dateRange: DateRange,
  filters: MetricsFilterState
): string {
  let csv = `Preflix Metrics Export - ${format(dateRange.from, 'MMM d, yyyy')} to ${format(dateRange.to, 'MMM d, yyyy')}\n\n`;
  
  // Add filter information
  if (Object.keys(filters).length > 0) {
    csv += "Applied Filters:\n";
    if (filters.cohort) csv += `Cohort: ${filters.cohort}\n`;
    if (filters.planType) csv += `Plan Type: ${filters.planType}\n`;
    if (filters.templateCategory) csv += `Template Category: ${filters.templateCategory}\n`;
    csv += "\n";
  }

  // Metrics data
  csv += "Metrics Data:\n";
  csv += "Date,Metric Type,Value\n";
  data.metrics.forEach(metric => {
    csv += `${format(new Date(metric.timestamp), 'yyyy-MM-dd')},${metric.metric_type},${metric.value}\n`;
  });
  
  // Cohort data
  csv += "\nCohort Retention Data:\n";
  csv += "Cohort Month,Period,Retention Rate,Users Count\n";
  data.cohortData.forEach(cohort => {
    csv += `${cohort.cohort_month},${cohort.period_number},${cohort.retention_rate}%,${cohort.users_count}\n`;
  });
  
  // Conversion data
  csv += "\nConversion Funnel Data:\n";
  csv += "Stage,Users Count,Conversion Rate,Stage Order\n";
  data.conversionData.forEach(conversion => {
    csv += `${conversion.stage},${conversion.users_count},${conversion.conversion_rate}%,${conversion.stage_order}\n`;
  });

  return csv;
}

function generateHTMLReport(
  data: ExportData,
  dateRange: DateRange,
  filters: MetricsFilterState
): string {
  const filterInfo = Object.keys(filters).length > 0 
    ? `<p><strong>Applied Filters:</strong> ${Object.entries(filters)
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')}</p>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Preflix Metrics Report</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 40px; 
          color: #333; 
        }
        h1 { 
          color: #0ea5e9; 
          border-bottom: 2px solid #0ea5e9; 
          padding-bottom: 10px; 
        }
        h2 { 
          color: #374151; 
          margin-top: 30px; 
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 15px; 
        }
        th, td { 
          border: 1px solid #d1d5db; 
          padding: 8px 12px; 
          text-align: left; 
        }
        th { 
          background-color: #f3f4f6; 
          font-weight: bold; 
        }
        .summary { 
          background-color: #f0f9ff; 
          padding: 15px; 
          border-radius: 8px; 
          margin: 20px 0; 
        }
        @media print {
          body { margin: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>Preflix Metrics Report</h1>
      <div class="summary">
        <p><strong>Date Range:</strong> ${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}</p>
        ${filterInfo}
        <p><strong>Generated:</strong> ${format(new Date(), 'MMM d, yyyy HH:mm')}</p>
      </div>
      
      <h2>Metrics Overview</h2>
      <table>
        <thead>
          <tr><th>Date</th><th>Metric Type</th><th>Value</th></tr>
        </thead>
        <tbody>
          ${data.metrics.map(metric => 
            `<tr>
              <td>${format(new Date(metric.timestamp), 'MMM d, yyyy')}</td>
              <td>${metric.metric_type}</td>
              <td>${metric.value}</td>
            </tr>`
          ).join('')}
        </tbody>
      </table>
      
      <h2>Cohort Retention</h2>
      <table>
        <thead>
          <tr><th>Cohort Month</th><th>Period</th><th>Retention Rate</th><th>Users Count</th></tr>
        </thead>
        <tbody>
          ${data.cohortData.map(cohort => 
            `<tr>
              <td>${cohort.cohort_month}</td>
              <td>${cohort.period_number}</td>
              <td>${cohort.retention_rate}%</td>
              <td>${cohort.users_count}</td>
            </tr>`
          ).join('')}
        </tbody>
      </table>
      
      <h2>Conversion Funnel</h2>
      <table>
        <thead>
          <tr><th>Stage</th><th>Users Count</th><th>Conversion Rate</th></tr>
        </thead>
        <tbody>
          ${data.conversionData.map(conversion => 
            `<tr>
              <td>${conversion.stage}</td>
              <td>${conversion.users_count}</td>
              <td>${conversion.conversion_rate}%</td>
            </tr>`
          ).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
}