/**
 * Google Apps Script for Consultation Booking Form
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. Go to Google Sheets and create a new spreadsheet
 * 2. Name it "Consultation Bookings" or any name you prefer
 * 3. Add these headers in Row 1:
 *    A1: Timestamp | B1: Full Name | C1: Age | D1: Email | E1: Phone | 
 *    F1: Consultation Type | G1: Urgency Level | H1: Preferred Date | 
 *    I1: Preferred Time | J1: Symptoms | K1: Medical History
 * 
 * 4. Go to Extensions > Apps Script
 * 5. Replace the default code with this entire script
 * 6. Click "Deploy" > "New deployment"
 * 7. Select type: "Web app"
 * 8. Set "Execute as": "Me"
 * 9. Set "Who has access": "Anyone"
 * 10. Click "Deploy" and copy the Web App URL
 * 11. Replace GOOGLE_SCRIPT_URL in consultation-options.tsx with your URL
 * 
 * OPTIONAL: Email Notification Setup
 * - Uncomment the sendEmailNotification function call in doPost
 * - Update DOCTOR_EMAIL with the actual email address
 */

// Configuration
const SPREADSHEET_ID = '1ajEpFzFUHg9MnYxAhxuCZwaKVI0xJvrP01-4VVKJVPI'; // Replace with your Google Sheet ID
const SHEET_NAME = 'Bookings';
const DOCTOR_EMAIL = 'patilvinita787@gmail.com'; // Demo email - replace with actual

/**
 * Handles POST requests from the website
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Check if it's a contact form or consultation form
    if (data.formType === 'contact') {
      // Save to Contact Messages sheet
      saveContactToSheet(data);
      // Send contact email notification
      sendContactEmailNotification(data);
    } else {
      // Save to Consultation Bookings sheet
      saveToSheet(data);
      // Send consultation email notification
      sendEmailNotification(data);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Data saved successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles GET requests (for testing)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'OK', message: 'Consultation Booking API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Saves booking data to Google Sheets
 */
function saveToSheet(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Add headers
    sheet.getRange(1, 1, 1, 11).setValues([[
      'Timestamp',
      'Full Name',
      'Age',
      'Email',
      'Phone',
      'Consultation Type',
      'Urgency Level',
      'Preferred Date',
      'Preferred Time',
      'Symptoms',
      'Medical History'
    ]]);
    // Format headers
    sheet.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#2F72B8').setFontColor('#ffffff');
  }
  
  // Append new row
  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.fullName,
    data.age,
    data.email,
    data.phone,
    data.consultationType,
    data.urgencyLevel,
    data.preferredDate,
    data.preferredTime,
    data.symptoms || '',
    data.medicalHistory || ''
  ]);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, 11);
}

/**
 * Sends email notification to doctor (optional)
 */
function sendEmailNotification(data) {
  const subject = `🏥 New Consultation Booking - ${data.fullName}`;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2F72B8, #5E3491); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0;">🏥 New Consultation Booking</h1>
      </div>
      
      <div style="padding: 20px; background: #f8f9fa; border: 1px solid #e9ecef;">
        <h2 style="color: #2F72B8; border-bottom: 2px solid #2F72B8; padding-bottom: 10px;">👤 Patient Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold;">Name:</td><td>${data.fullName}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Age:</td><td>${data.age}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td><a href="tel:${data.phone}">${data.phone}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${data.email}">${data.email}</a></td></tr>
        </table>
        
        <h2 style="color: #5E3491; border-bottom: 2px solid #5E3491; padding-bottom: 10px; margin-top: 20px;">📋 Consultation Info</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold;">Type:</td><td>${data.consultationType}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Urgency:</td><td>${data.urgencyLevel}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Preferred Date:</td><td>${data.preferredDate}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Preferred Time:</td><td>${data.preferredTime}</td></tr>
        </table>
        
        <h2 style="color: #2F72B8; border-bottom: 2px solid #2F72B8; padding-bottom: 10px; margin-top: 20px;">🩺 Symptoms</h2>
        <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #2F72B8;">
          ${data.symptoms || 'Not specified'}
        </p>
        
        <h2 style="color: #5E3491; border-bottom: 2px solid #5E3491; padding-bottom: 10px; margin-top: 20px;">📝 Medical History</h2>
        <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #5E3491;">
          ${data.medicalHistory || 'Not specified'}
        </p>
      </div>
      
      <div style="background: #2F72B8; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="margin: 0;">Submitted: ${new Date(data.timestamp).toLocaleString()}</p>
      </div>
    </div>
  `;
  
  MailApp.sendEmail({
    to: DOCTOR_EMAIL,
    subject: subject,
    htmlBody: htmlBody
  });
}

/**
 * Saves contact form data to Google Sheets
 */
function saveContactToSheet(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Contact Messages');
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet('Contact Messages');
    // Add headers
    sheet.getRange(1, 1, 1, 7).setValues([[
      'Timestamp',
      'Full Name',
      'Email',
      'Phone',
      'Inquiry Type',
      'Subject',
      'Message'
    ]]);
    // Format headers
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#5E3491').setFontColor('#ffffff');
  }
  
  // Append new row
  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.fullName,
    data.email,
    data.phone,
    data.inquiryType,
    data.subject,
    data.message
  ]);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, 7);
}

/**
 * Sends contact form email notification to doctor
 */
function sendContactEmailNotification(data) {
  const subject = `📧 New Contact Message - ${data.subject}`;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #5E3491, #2F72B8); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0;">📧 New Contact Message</h1>
      </div>
      
      <div style="padding: 20px; background: #f8f9fa; border: 1px solid #e9ecef;">
        <h2 style="color: #5E3491; border-bottom: 2px solid #5E3491; padding-bottom: 10px;">👤 Contact Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold;">Name:</td><td>${data.fullName}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${data.email}">${data.email}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td><a href="tel:${data.phone}">${data.phone}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Inquiry Type:</td><td>${data.inquiryType}</td></tr>
        </table>
        
        <h2 style="color: #2F72B8; border-bottom: 2px solid #2F72B8; padding-bottom: 10px; margin-top: 20px;">📋 Subject</h2>
        <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #2F72B8; font-weight: bold;">
          ${data.subject}
        </p>
        
        <h2 style="color: #5E3491; border-bottom: 2px solid #5E3491; padding-bottom: 10px; margin-top: 20px;">💬 Message</h2>
        <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #5E3491; white-space: pre-wrap;">
          ${data.message}
        </p>
      </div>
      
      <div style="background: #5E3491; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="margin: 0;">Submitted: ${new Date(data.timestamp).toLocaleString()}</p>
      </div>
    </div>
  `;
  
  MailApp.sendEmail({
    to: DOCTOR_EMAIL,
    subject: subject,
    htmlBody: htmlBody
  });
}

/**
 * Test function - Run this to test the setup
 */
function testSetup() {
  const testData = {
    timestamp: new Date().toISOString(),
    fullName: 'Test Patient',
    age: '30',
    email: 'test@example.com',
    phone: '+91 9876543210',
    consultationType: 'video',
    urgencyLevel: 'routine',
    preferredDate: '2025-12-10',
    preferredTime: 'morning',
    symptoms: 'Test symptoms',
    medicalHistory: 'Test medical history'
  };
  
  saveToSheet(testData);
  Logger.log('Test data saved successfully!');
}
