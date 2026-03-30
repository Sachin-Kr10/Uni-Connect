const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const payload = {
      sender: {
        name: 'Uni-Connect',
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email: to }],
      subject: subject,
      textContent: text,
      htmlContent: html,
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API Error:', errorData);
      throw new Error(`Email sending failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Brevo Email sent successfully. Message ID:', data.messageId);
    return data;
  } catch (error) {
    console.error('Error in sendEmail (Brevo):', error);
    throw new Error('Email sending failed');
  }
};

module.exports = sendEmail;
