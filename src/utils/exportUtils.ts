import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { AppData, Camp } from '../types';

export const CORRIDORS = [
  { id: 'pkr', name: 'PKR', flag: '🇵🇰', code: 'PKR' },
  { id: 'inr', name: 'INR', flag: '🇮🇳', code: 'INR' },
  { id: 'php', name: 'PHP', flag: '🇵🇭', code: 'PHP' },
  { id: 'bdt', name: 'BDT', flag: '🇧🇩', code: 'BDT' },
  { id: 'npr', name: 'NPR', flag: '🇳🇵', code: 'NPR' },
  { id: 'lkr', name: 'LKR', flag: '🇱🇰', code: 'LKR' },
  { id: 'egp', name: 'EGP', flag: '🇪🇬', code: 'EGP' },
  { id: 'usd', name: 'USD', flag: '🇺🇸', code: 'USD' }
];

export const SOCIAL_PLATFORMS = {
  facebook: { name: 'Facebook', icon: '📘', color: '#1877F2' },
  instagram: { name: 'Instagram', icon: '📸', color: '#E4405F' },
  tiktok: { name: 'TikTok', icon: '🎵', color: '#000000' },
  youtube: { name: 'YouTube', icon: '▶️', color: '#FF0000' }
};

export function generateFullReport(appData: AppData): string {
  const today = new Date().toLocaleDateString();
  const agent = appData.settings.agentName || 'Agent';

  let report = '📊 *AGENT BOOK MARKETING REPORT*\n';
  report += '='.repeat(40) + '\n\n';
  report += `📅 *Date:* ${today}\n`;
  report += `👤 *Agent:* ${agent}\n`;
  report += `📍 *Location:* Oman\n\n`;

  // Summary
  report += '📈 *SUMMARY:*\n';
  report += '-'.repeat(24) + '\n';
  report += `🏢 Companies: ${appData.companies.length}\n`;
  report += `🏕️ Camps: ${appData.camps.length}\n`;
  report += `👥 Customers: ${appData.customers.length}\n`;
  report += `📍 Visits: ${appData.visits.length}\n`;
  report += `💬 Feedback: ${appData.feedback.length}\n`;
  report += `⚠️ Complaints: ${appData.complaints.length}\n`;
  report += `🏪 Competitor Intel: ${appData.competitors.length}\n`;
  report += `📱 Social Ads: ${appData.social.length}\n`;
  report += `📋 Marketing Plans: ${appData.plans.length}\n\n`;

  // Companies
  if (appData.companies.length > 0) {
    report += '🏢 *COMPANIES:*\n';
    report += '-'.repeat(24) + '\n';
    appData.companies.forEach((c, i) => {
      report += `${i + 1}. ${c.name} ${c.phone ? `(${c.phone})` : ''}\n`;
      if (c.contact) report += `   👤 Contact: ${c.contact}\n`;
      if (c.address) report += `   📍 Address: ${c.address}\n`;
      if (c.boss_name) report += `   🏕️ Camp Boss: ${c.boss_name} ${c.boss_phone ? `(${c.boss_phone})` : ''}\n`;
      if (c.notes) report += `   📝 Notes: ${c.notes}\n`;
    });
    report += '\n';
  }

  // Camps
  if (appData.camps.length > 0) {
    report += '🏕️ *CAMPS:*\n';
    report += '-'.repeat(24) + '\n';
    appData.camps.forEach((c, i) => {
      report += `${i + 1}. ${c.name} (${c.location})\n`;
      if (c.company) report += `   🏢 Company: ${c.company}\n`;
      report += `   👤 Camp Boss: ${c.boss_name} (${c.boss_phone})\n`;
      if (c.workers) report += `   👷 Workers: ${c.workers}\n`;
      if (c.notes) report += `   📝 Notes: ${c.notes}\n`;
    });
    report += '\n';
  }

  // Customers
  if (appData.customers.length > 0) {
    report += '👥 *CUSTOMERS:*\n';
    report += '-'.repeat(24) + '\n';
    appData.customers.forEach((c, i) => {
      report += `${i + 1}. ${c.name} - ${c.phone || 'No phone'} (${c.location || 'No location'}) [${c.type}]\n`;
    });
    report += '\n';
  }

  // Recent Visits
  if (appData.visits.length > 0) {
    report += '📍 *RECENT VISITS:*\n';
    report += '-'.repeat(24) + '\n';
    appData.visits.forEach((v, i) => {
      report += `${i + 1}. ${v.place} (${v.type}) - ${v.people} people\n`;
      if (v.notes) report += `   📝 Notes: ${v.notes}\n`;
    });
    report += '\n';
  }

  // Feedback
  if (appData.feedback.length > 0) {
    report += '💬 *FEEDBACK:*\n';
    report += '-'.repeat(24) + '\n';
    appData.feedback.forEach((f, i) => {
      const stars = '⭐'.repeat(Math.min(f.rating || 0, 5));
      report += `${i + 1}. ${f.customer || 'Anonymous'} - ${stars} (${f.type})\n`;
      if (f.feedback) report += `   💬 Feedback: ${f.feedback}\n`;
    });
    report += '\n';
  }

  // Complaints
  if (appData.complaints.length > 0) {
    report += '⚠️ *COMPLAINTS:*\n';
    report += '-'.repeat(24) + '\n';
    appData.complaints.forEach((c, i) => {
      report += `${i + 1}. ${c.customer} - [${c.category}] - Status: ${c.status}\n`;
      report += `   📝 Description: ${c.description}\n`;
    });
    report += '\n';
  }

  // Competitors
  if (appData.competitors.length > 0) {
    report += '🏪 *COMPETITOR STRATEGIES:*\n';
    report += '-'.repeat(24) + '\n';
    appData.competitors.forEach((c, i) => {
      report += `${i + 1}. ${c.name} - Strategy: ${c.strategy} [Impact: ${c.impact}]\n`;
      if (c.notes) report += `   📝 Notes: ${c.notes}\n`;
    });
    report += '\n';
  }

  // Social Ads
  if (appData.social.length > 0) {
    report += '📱 *SOCIAL ADS:*\n';
    report += '-'.repeat(24) + '\n';
    appData.social.forEach((s, i) => {
      const platformName = SOCIAL_PLATFORMS[s.platform as keyof typeof SOCIAL_PLATFORMS]?.name || s.platform;
      report += `${i + 1}. ${platformName}: ${s.title} [Budget: ${s.budget || 'N/A'}] - Status: ${s.status}\n`;
    });
    report += '\n';
  }

  // Marketing Plans
  if (appData.plans.length > 0) {
    report += '📋 *MARKETING PLANS:*\n';
    report += '-'.repeat(24) + '\n';
    appData.plans.forEach((p, i) => {
      report += `${i + 1}. ${p.title} [Budget: ${p.budget || 'N/A'}] - Status: ${p.status}\n`;
      report += `   📝 Details: ${p.details}\n`;
    });
    report += '\n';
  }

  // Exchange Rates
  report += '🌐 *EXCHANGE RATES (OMR →):*\n';
  report += '-'.repeat(24) + '\n';
  CORRIDORS.forEach(c => {
    const val = appData.rates[c.id];
    if (val) {
      report += `   ${c.flag} ${c.name}: ${Number(val).toFixed(2)}\n`;
    }
  });

  report += '\n' + '='.repeat(40) + '\n';
  report += `📊 Generated via Marketing Agent Notebook at ${new Date().toLocaleString()}`;

  return report;
}

export function exportPDF(appData: AppData): void {
  try {
    const doc = new jsPDF('landscape', 'mm', 'a4');

    // Title Block
    doc.setFontSize(22);
    doc.setTextColor(26, 60, 110);
    doc.text('🏦 Marketing Agent Notebook - Intelligence Report', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Agent Name: ${appData.settings.agentName || 'Not Set'}`, 14, 28);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 34);
    doc.text(`Total Companies: ${appData.companies.length} | Camps: ${appData.camps.length} | Customers: ${appData.customers.length}`, 14, 40);

    let startY = 46;

    // 1. Companies Table
    if (appData.companies.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(26, 60, 110);
      doc.text('🏢 Registered Companies', 14, startY);
      
      const compHeaders = [['#', 'Company Name', 'Contact Person', 'Phone', 'Address', 'Camp Boss', 'Boss Phone']];
      const compBody = appData.companies.map((c, i) => [
        String(i + 1),
        c.name,
        c.contact || '-',
        c.phone || '-',
        c.address || '-',
        c.boss_name || '-',
        c.boss_phone || '-'
      ]);

      (doc as any).autoTable({
        startY: startY + 4,
        head: compHeaders,
        body: compBody,
        theme: 'striped',
        headStyles: { fillColor: [26, 60, 110], textColor: [255, 255, 255], fontSize: 8 },
        bodyStyles: { fontSize: 7.5 },
        margin: { left: 14, right: 14 }
      });

      startY = (doc as any).lastAutoTable.finalY + 12;
    }

    // 2. Camps Table (A4 page breaks handled automatically by autoTable)
    if (appData.camps.length > 0) {
      if (startY > doc.internal.pageSize.height - 40) {
        doc.addPage();
        startY = 20;
      }
      doc.setFontSize(14);
      doc.setTextColor(26, 60, 110);
      doc.text('🏕️ Registered Labor Camps', 14, startY);

      const campHeaders = [['#', 'Camp Name', 'Location', 'Associated Company', 'Camp Boss Name', 'Boss Phone', 'Workers Count']];
      const campBody = appData.camps.map((c, i) => [
        String(i + 1),
        c.name,
        c.location,
        c.company || '-',
        c.boss_name,
        c.boss_phone,
        String(c.workers || 0)
      ]);

      (doc as any).autoTable({
        startY: startY + 4,
        head: campHeaders,
        body: campBody,
        theme: 'striped',
        headStyles: { fillColor: [26, 60, 110], textColor: [255, 255, 255], fontSize: 8 },
        bodyStyles: { fontSize: 7.5 },
        margin: { left: 14, right: 14 }
      });

      startY = (doc as any).lastAutoTable.finalY + 12;
    }

    // 3. Customer Visits Table
    if (appData.visits.length > 0) {
      if (startY > doc.internal.pageSize.height - 40) {
        doc.addPage();
        startY = 20;
      }
      doc.setFontSize(14);
      doc.setTextColor(26, 60, 110);
      doc.text('📍 Field Visits Log', 14, startY);

      const visitHeaders = [['#', 'Place / Location', 'Type', 'Est. People Reached', 'Key Notes / Observations', 'Date & Time']];
      const visitBody = appData.visits.map((v, i) => [
        String(i + 1),
        v.place,
        v.type.toUpperCase(),
        String(v.people || 0),
        v.notes || '-',
        `${v.date} ${v.time}`
      ]);

      (doc as any).autoTable({
        startY: startY + 4,
        head: visitHeaders,
        body: visitBody,
        theme: 'striped',
        headStyles: { fillColor: [26, 60, 110], textColor: [255, 255, 255], fontSize: 8 },
        bodyStyles: { fontSize: 7.5 },
        margin: { left: 14, right: 14 }
      });

      startY = (doc as any).lastAutoTable.finalY + 12;
    }

    // 4. Competitor Intel Table
    if (appData.competitors.length > 0) {
      if (startY > doc.internal.pageSize.height - 40) {
        doc.addPage();
        startY = 20;
      }
      doc.setFontSize(14);
      doc.setTextColor(26, 60, 110);
      doc.text('🏪 Competitor Intel & Market Insights', 14, startY);

      const compIntelHeaders = [['#', 'Competitor Name', 'Observed Strategy', 'Threat / Impact Level', 'Detailed Notes', 'Recorded Date']];
      const compIntelBody = appData.competitors.map((c, i) => [
        String(i + 1),
        c.name,
        c.strategy,
        c.impact,
        c.notes || '-',
        c.date
      ]);

      (doc as any).autoTable({
        startY: startY + 4,
        head: compIntelHeaders,
        body: compIntelBody,
        theme: 'striped',
        headStyles: { fillColor: [26, 60, 110], textColor: [255, 255, 255], fontSize: 8 },
        bodyStyles: { fontSize: 7.5 },
        margin: { left: 14, right: 14 }
      });

      startY = (doc as any).lastAutoTable.finalY + 12;
    }

    // Footer pagination text
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(150);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Marketing Agent Notebook © ${new Date().getFullYear()} · Page ${i} of ${pageCount}`,
        14,
        doc.internal.pageSize.height - 8
      );
    }

    doc.save(`Marketing_Agent_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (error) {
    console.error('PDF generation error:', error);
  }
}

export function exportExcel(appData: AppData): void {
  try {
    const wb = XLSX.utils.book_new();

    // 1. Companies Sheet
    if (appData.companies.length > 0) {
      const compRows = appData.companies.map((c, i) => ({
        'S.No': i + 1,
        'Company Name': c.name,
        'Contact Person': c.contact || '',
        'Phone Number': c.phone || '',
        'Address': c.address || '',
        'Camp Boss Name': c.boss_name || '',
        'Camp Boss Phone': c.boss_phone || '',
        'Observations / Notes': c.notes || '',
        'Added Date': c.date
      }));
      const wsComp = XLSX.utils.json_to_sheet(compRows);
      XLSX.utils.book_append_sheet(wb, wsComp, 'Companies');
    }

    // 2. Camps Sheet
    if (appData.camps.length > 0) {
      const campRows = appData.camps.map((c, i) => ({
        'S.No': i + 1,
        'Camp Name': c.name,
        'Location / Area': c.location,
        'Sponsoring Company': c.company || '',
        'Camp Boss Name': c.boss_name,
        'Camp Boss Phone': c.boss_phone,
        'Total Workers': c.workers,
        'Special Notes': c.notes || '',
        'Recorded Date': c.date
      }));
      const wsCamp = XLSX.utils.json_to_sheet(campRows);
      XLSX.utils.book_append_sheet(wb, wsCamp, 'Labor Camps');
    }

    // 3. Customers Sheet
    if (appData.customers.length > 0) {
      const custRows = appData.customers.map((c, i) => ({
        'S.No': i + 1,
        'Customer Name': c.name,
        'Contact Number': c.phone || '',
        'Location': c.location || '',
        'Customer Segment': c.type,
        'Special Requests / Notes': c.notes || '',
        'Enrollment Date': c.date
      }));
      const wsCust = XLSX.utils.json_to_sheet(custRows);
      XLSX.utils.book_append_sheet(wb, wsCust, 'Customers');
    }

    // 4. Visits Sheet
    if (appData.visits.length > 0) {
      const visitRows = appData.visits.map((v, i) => ({
        'S.No': i + 1,
        'Visited Place': v.place,
        'Activity Category': v.type.toUpperCase(),
        'Est. Crowd Reached': v.people,
        'Key Findings': v.notes || '',
        'Visit Date': v.date,
        'Visit Time': v.time
      }));
      const wsVisits = XLSX.utils.json_to_sheet(visitRows);
      XLSX.utils.book_append_sheet(wb, wsVisits, 'Field Visits Log');
    }

    // 5. Feedback Sheet
    if (appData.feedback.length > 0) {
      const fbRows = appData.feedback.map((f, i) => ({
        'S.No': i + 1,
        'Customer': f.customer || 'Anonymous',
        'Vibe / Sentiment': f.type,
        'Rating (1-5 Stars)': f.rating,
        'Detailed Feedback Text': f.feedback,
        'Date': f.date
      }));
      const wsFb = XLSX.utils.json_to_sheet(fbRows);
      XLSX.utils.book_append_sheet(wb, wsFb, 'Customer Feedback');
    }

    // 6. Complaints Sheet
    if (appData.complaints.length > 0) {
      const compRows = appData.complaints.map((c, i) => ({
        'S.No': i + 1,
        'Customer Name': c.customer,
        'Incident Category': c.category,
        'Current Status': c.status,
        'Detailed Complaint / Issue': c.description,
        'Filing Date': c.date
      }));
      const wsComp = XLSX.utils.json_to_sheet(compRows);
      XLSX.utils.book_append_sheet(wb, wsComp, 'Customer Complaints');
    }

    // 7. Competitor Intel Sheet
    if (appData.competitors.length > 0) {
      const competitorRows = appData.competitors.map((c, i) => ({
        'S.No': i + 1,
        'Competitor Name': c.name,
        'Marketing Strategy Observed': c.strategy,
        'Market Impact Level': c.impact,
        'Detailed Analytics / Notes': c.notes || '',
        'Date Gathered': c.date
      }));
      const wsCompIntel = XLSX.utils.json_to_sheet(competitorRows);
      XLSX.utils.book_append_sheet(wb, wsCompIntel, 'Competitor Intel');
    }

    // 8. Social Ads Sheet
    if (appData.social.length > 0) {
      const socialRows = appData.social.map((s, i) => ({
        'S.No': i + 1,
        'Social Media Platform': SOCIAL_PLATFORMS[s.platform as keyof typeof SOCIAL_PLATFORMS]?.name || s.platform,
        'Ad Campaign Title': s.title,
        'Allocated Budget': s.budget || 'N/A',
        'Campaign Status': s.status,
        'Campaign Remarks / Notes': s.notes || '',
        'Launch Date': s.date
      }));
      const wsSocial = XLSX.utils.json_to_sheet(socialRows);
      XLSX.utils.book_append_sheet(wb, wsSocial, 'Social Ads');
    }

    // 9. Marketing Plans Sheet
    if (appData.plans.length > 0) {
      const planRows = appData.plans.map((p, i) => ({
        'S.No': i + 1,
        'Strategic Plan Title': p.title,
        'Plan Deliverables / Details': p.details,
        'Estimated Budget': p.budget || 'N/A',
        'Current Implementation Status': p.status,
        'Proposed Date': p.date
      }));
      const wsPlans = XLSX.utils.json_to_sheet(planRows);
      XLSX.utils.book_append_sheet(wb, wsPlans, 'Marketing Plans');
    }

    // 10. Summary Sheet
    const summaryRows = [
      { 'Metrics KPI': 'Marketing Agent Notebook Intelligence Export', 'Value': '' },
      { 'Metrics KPI': 'Export Date & Time', 'Value': new Date().toLocaleString() },
      { 'Metrics KPI': 'Agent Name', 'Value': appData.settings.agentName || 'Agent' },
      { 'Metrics KPI': 'Total Enrolled Companies', 'Value': appData.companies.length },
      { 'Metrics KPI': 'Total Enrolled labor Camps', 'Value': appData.camps.length },
      { 'Metrics KPI': 'Total Tracked Customers', 'Value': appData.customers.length },
      { 'Metrics KPI': 'Total Logged Visits', 'Value': appData.visits.length },
      { 'Metrics KPI': 'Total Customer Feedback Items', 'Value': appData.feedback.length },
      { 'Metrics KPI': 'Total Registered Complaints', 'Value': appData.complaints.length },
      { 'Metrics KPI': 'Total Competitor Intel Tracks', 'Value': appData.competitors.length },
      { 'Metrics KPI': 'Total Social Media Ad Campaigns', 'Value': appData.social.length },
      { 'Metrics KPI': 'Total Strategic Marketing Plans', 'Value': appData.plans.length }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Operations Summary');

    // 11. Exchange Rates Sheet
    const rateRows = CORRIDORS.map(c => ({
      'Currency Code': c.name,
      'Currency Name': c.flag + ' ' + c.name,
      'Rate OMR to Currency': appData.rates[c.id] ? Number(appData.rates[c.id]).toFixed(2) : 'N/A'
    }));
    const wsRates = XLSX.utils.json_to_sheet(rateRows);
    XLSX.utils.book_append_sheet(wb, wsRates, 'Exchange Rates');

    XLSX.writeFile(wb, `Marketing_Agent_Database_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (error) {
    console.error('Excel generation error:', error);
  }
}

export function exportCategoryCampsToExcel(camps: Camp[], categoryName: string): void {
  exportCampsToExcel(
    camps.filter((c) => c.category === categoryName),
    `Camps_${categoryName}`
  );
}

export function generateCategoryCampsSummaryText(camps: Camp[], categoryName: string): string {
  return generateCampsSummaryText(
    camps.filter((c) => c.category === categoryName),
    `LABOR CAMPS SUMMARY — ${categoryName.toUpperCase()}`
  );
}

export function exportCampsToPdf(camps: Camp[], title: string = 'Labor Camps Details Report'): void {
  try {
    if (camps.length === 0) {
      alert('No camps available to export.');
      return;
    }

    const doc = new jsPDF('landscape', 'mm', 'a4');

    // Title Header
    doc.setFontSize(18);
    doc.setTextColor(15, 27, 51);
    doc.text(`Agent Book — ${title}`, 14, 18);

    const getOrdinal = (day?: number): string => {
      if (!day || day < 1 || day > 31) return '-';
      if (day >= 11 && day <= 13) return `${day}th`;
      switch (day % 10) {
        case 1: return `${day}st`;
        case 2: return `${day}nd`;
        case 3: return `${day}rd`;
        default: return `${day}th`;
      }
    };

    const totalWorkers = camps.reduce((acc, c) => acc + (c.workers ? parseInt(String(c.workers), 10) || 0 : 0), 0);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 25);
    doc.text(`Total Camps: ${camps.length} | Total Workers Covered: ${totalWorkers.toLocaleString()}`, 14, 30);

    const headers = [['#', 'Camp Name', 'Category', 'Region / City', 'Location', 'Landmark', 'Sponsoring Company', 'Camp Boss Name', 'Boss Phone', 'Workers', 'Salary Day', 'Notes']];
    const body = camps.map((c, i) => [
      String(i + 1),
      c.name || '-',
      c.category || '-',
      c.region || '-',
      c.location || '-',
      c.landmark || '-',
      c.company || '-',
      c.boss_name || '-',
      c.boss_phone || '-',
      String(c.workers || 0),
      c.salaryDate ? getOrdinal(c.salaryDate) : '-',
      c.notes || '-'
    ]);

    (doc as any).autoTable({
      startY: 35,
      head: headers,
      body: body,
      theme: 'striped',
      headStyles: { fillColor: [15, 27, 51], textColor: [201, 162, 39], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7.5 },
      margin: { left: 14, right: 14 }
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Agent Book Field Operations © ${new Date().getFullYear()} · Page ${i} of ${pageCount}`,
        14,
        doc.internal.pageSize.height - 8
      );
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${cleanTitle}_${dateStr}.pdf`);
  } catch (error) {
    console.error('Camps PDF export error:', error);
  }
}

export function exportCampsToExcel(camps: Camp[], title: string = 'Labor_Camps'): void {
  try {
    if (camps.length === 0) {
      alert('No camps available to export.');
      return;
    }

    const getOrdinal = (day?: number): string => {
      if (!day || day < 1 || day > 31) return '-';
      if (day >= 11 && day <= 13) return `${day}th`;
      switch (day % 10) {
        case 1: return `${day}st`;
        case 2: return `${day}nd`;
        case 3: return `${day}rd`;
        default: return `${day}th`;
      }
    };

    const rows = camps.map((c, i) => ({
      'S.No': i + 1,
      'Camp Name': c.name || '-',
      'Category': c.category || '-',
      'Region / City': c.region || '-',
      'Location': c.location || '-',
      'Landmark': c.landmark || '-',
      'Sponsoring Company': c.company || '-',
      'Camp Boss Name': c.boss_name || '-',
      'Camp Boss Phone': c.boss_phone || '-',
      'Worker Count': c.workers ? Number(c.workers) : 0,
      'Salary Date': c.salaryDate ? getOrdinal(c.salaryDate) : '-',
      'Notes': c.notes || '-',
      'Recorded Date': c.date || '-'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Labor Camps');

    const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `${cleanTitle}_${dateStr}.xlsx`);
  } catch (error) {
    console.error('Camps Excel export error:', error);
  }
}

export function generateCampsSummaryText(camps: Camp[], title: string = 'LABOR CAMPS DETAILS REPORT'): string {
  const today = new Date().toLocaleDateString();

  let text = `🏕️ *${title.toUpperCase()}*\n`;
  text += `📅 *Date:* ${today}\n`;
  text += `📊 *Total Camps:* ${camps.length}\n`;

  let totalWorkers = 0;
  camps.forEach((c) => {
    totalWorkers += c.workers ? parseInt(String(c.workers), 10) || 0 : 0;
  });
  text += `👷 *Total Workers Covered:* ${totalWorkers.toLocaleString()}\n`;
  text += '='.repeat(38) + '\n\n';

  if (camps.length === 0) {
    text += `No camps recorded.\n`;
  } else {
    camps.forEach((c, i) => {
      text += `${i + 1}. *${c.name}*\n`;
      if (c.category) text += `   🏷️ Category: ${c.category}\n`;
      text += `   📍 Region/City: ${c.region || 'Unspecified'}\n`;
      text += `   🗺️ Location: ${c.location || 'N/A'}${c.landmark ? ` (${c.landmark})` : ''}\n`;
      if (c.company) text += `   🏢 Company: ${c.company}\n`;
      text += `   👤 Boss: ${c.boss_name || 'N/A'} ${c.boss_phone ? `(${c.boss_phone})` : ''}\n`;
      text += `   👷 Workers: ${c.workers || '0'}\n`;
      if (c.salaryDate) text += `   📅 Salary Payday: Day ${c.salaryDate} of month\n`;
      if (c.notes) text += `   📝 Notes: ${c.notes}\n`;
      text += '\n';
    });

    text += '-'.repeat(38) + '\n';
    text += `👥 *SUMMARY:* ${camps.length} Camps | ${totalWorkers.toLocaleString()} Total Workers\n`;
    text += `🏬 *Agent Book Field Operations*\n`;
  }

  return text;
}

export function shareCampsViaWhatsApp(camps: Camp[], title?: string, targetPhone?: string): void {
  const text = generateCampsSummaryText(camps, title);
  const cleanPhone = targetPhone ? targetPhone.replace(/[^0-9]/g, '') : '';
  const waUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');
}

export function shareCampsViaEmail(camps: Camp[], title?: string, targetEmail?: string): void {
  const text = generateCampsSummaryText(camps, title);
  const dateStr = new Date().toISOString().slice(0, 10);
  const subject = `${title || 'Labor Camps Details Report'} — ${dateStr}`;
  const mailtoUrl = `mailto:${targetEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  window.location.href = mailtoUrl;
}

