import { useEffect } from 'react';
import { Container, Title, Text, Stack, Paper } from '@mantine/core';
import { Link } from 'react-router-dom';

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Container size="lg" py="xl" style={{ minHeight: '80vh' }}>
      <Paper p="xl" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
        <Stack gap="xl">
          <div>
            <Title order={1} mb="md">Privacy Policy</Title>
            <Text size="sm" c="dimmed">Last updated: {new Date().toLocaleDateString()}</Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">1. Introduction</Title>
            <Text mb="md">
              Fullstack (Family Alliance for Multi-generational International Legacy and Sustainability) is committed 
              to protecting your privacy and ensuring the security of your personal and financial information. This 
              Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use 
              our multi-generational financial management platform.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">2. Information We Collect</Title>
            
            <Title order={3} size="h4" mb="sm" mt="md">2.1 Personal Information</Title>
            <Text mb="md">
              We collect personal information that you provide directly to us, including:
            </Text>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li><Text>Name, email address, phone number, and contact information</Text></li>
              <li><Text>Account credentials and authentication information</Text></li>
              <li><Text>Demographic information and family structure details</Text></li>
              <li><Text>Financial information necessary for providing our services</Text></li>
              <li><Text>Communication preferences and correspondence</Text></li>
            </ul>

            <Title order={3} size="h4" mb="sm" mt="md">2.2 Financial Information</Title>
            <Text mb="md">
              To provide multi-generational financial management services, we may collect:
            </Text>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li><Text>Asset information and valuations</Text></li>
              <li><Text>Investment portfolios and holdings</Text></li>
              <li><Text>Estate planning documents and information</Text></li>
              <li><Text>Beneficiary and family member information</Text></li>
              <li><Text>Financial goals and objectives</Text></li>
            </ul>

            <Title order={3} size="h4" mb="sm" mt="md">2.3 Automatically Collected Information</Title>
            <Text mb="md">
              When you use our services, we automatically collect certain information, including:
            </Text>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li><Text>Device information and identifiers</Text></li>
              <li><Text>IP address and location data</Text></li>
              <li><Text>Browser type and version</Text></li>
              <li><Text>Usage patterns and interaction data</Text></li>
              <li><Text>Cookies and similar tracking technologies</Text></li>
            </ul>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">3. How We Use Your Information</Title>
            <Text mb="md">We use the information we collect to:</Text>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li><Text>Provide, maintain, and improve our financial management services</Text></li>
              <li><Text>Process transactions and manage your account</Text></li>
              <li><Text>Communicate with you about your account and our services</Text></li>
              <li><Text>Send you important updates, security alerts, and administrative messages</Text></li>
              <li><Text>Personalize your experience and provide customized recommendations</Text></li>
              <li><Text>Detect, prevent, and address technical issues and security threats</Text></li>
              <li><Text>Comply with legal obligations and enforce our Terms of Service</Text></li>
              <li><Text>Conduct research and analytics to improve our services</Text></li>
            </ul>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">4. Information Sharing and Disclosure</Title>
            <Text mb="md">We do not sell your personal information. We may share your information in the following circumstances:</Text>
            
            <Title order={3} size="h4" mb="sm" mt="md">4.1 Service Providers</Title>
            <Text mb="md">
              We may share information with third-party service providers who perform services on our behalf, 
              such as cloud hosting, data analytics, payment processing, and customer support. These providers 
              are contractually obligated to protect your information.
            </Text>

            <Title order={3} size="h4" mb="sm" mt="md">4.2 Legal Requirements</Title>
            <Text mb="md">
              We may disclose information if required by law, court order, or governmental regulation, or if 
              we believe disclosure is necessary to protect our rights, property, or safety, or that of our users.
            </Text>

            <Title order={3} size="h4" mb="sm" mt="md">4.3 Business Transfers</Title>
            <Text mb="md">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred to 
              the acquiring entity, subject to the same privacy protections.
            </Text>

            <Title order={3} size="h4" mb="sm" mt="md">4.4 With Your Consent</Title>
            <Text mb="md">
              We may share your information with third parties when you have given us explicit consent to do so.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">5. Data Security</Title>
            <Text mb="md">
              We implement industry-standard security measures to protect your information, including:
            </Text>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li><Text>Encryption of data in transit and at rest</Text></li>
              <li><Text>Secure authentication and access controls</Text></li>
              <li><Text>Regular security assessments and updates</Text></li>
              <li><Text>Employee training on data protection</Text></li>
              <li><Text>Incident response and breach notification procedures</Text></li>
            </ul>
            <Text mb="md" mt="md">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While 
              we strive to protect your information, we cannot guarantee absolute security.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">6. Data Retention</Title>
            <Text mb="md">
              We retain your personal information for as long as necessary to provide our services, comply with 
              legal obligations, resolve disputes, and enforce our agreements. When information is no longer needed, 
              we will securely delete or anonymize it in accordance with our data retention policies.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">7. Your Rights and Choices</Title>
            <Text mb="md">Depending on your jurisdiction, you may have the following rights:</Text>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li><Text><strong>Access:</strong> Request access to your personal information</Text></li>
              <li><Text><strong>Correction:</strong> Request correction of inaccurate information</Text></li>
              <li><Text><strong>Deletion:</strong> Request deletion of your personal information</Text></li>
              <li><Text><strong>Portability:</strong> Request transfer of your data to another service</Text></li>
              <li><Text><strong>Objection:</strong> Object to certain processing activities</Text></li>
              <li><Text><strong>Restriction:</strong> Request restriction of processing</Text></li>
              <li><Text><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</Text></li>
            </ul>
            <Text mb="md" mt="md">
              To exercise these rights, please contact us using the information provided in the Contact section below.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">8. Cookies and Tracking Technologies</Title>
            <Text mb="md">
              We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, 
              and improve our services. You can control cookie preferences through your browser settings. However, 
              disabling cookies may limit certain features of our services.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">9. Children's Privacy</Title>
            <Text mb="md">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect 
              personal information from children. If we become aware that we have collected information from a 
              child, we will take steps to delete such information promptly.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">10. International Data Transfers</Title>
            <Text mb="md">
              Your information may be transferred to and processed in countries other than your country of residence. 
              These countries may have different data protection laws. We ensure appropriate safeguards are in place 
              to protect your information in accordance with this Privacy Policy.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">11. Changes to This Privacy Policy</Title>
            <Text mb="md">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by 
              posting the updated policy on our website and updating the "Last updated" date. Your continued use 
              of our services after such changes constitutes acceptance of the updated Privacy Policy.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">12. Contact Us</Title>
            <Text mb="md">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
              please contact us through our contact form or at the contact information provided on our website.
            </Text>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Text size="sm" c="dimmed">
              <Link to="/" style={{ color: 'inherit', textDecoration: 'underline' }}>Return to Home</Link>
            </Text>
          </div>
        </Stack>
      </Paper>
    </Container>
  );
}

