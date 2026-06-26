import { useEffect } from 'react';
import { Container, Title, Text, Stack, Paper } from '@mantine/core';
import { Link } from 'react-router-dom';

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Container size="lg" py="xl" style={{ minHeight: '80vh' }}>
      <Paper p="xl" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
        <Stack gap="xl">
          <div>
            <Title order={1} mb="md">Terms of Service</Title>
            <Text size="sm" c="dimmed">Last updated: {new Date().toLocaleDateString()}</Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">1. Introduction</Title>
            <Text mb="md">
              Welcome to FAMILyS (Family Alliance for Multi-generational International Legacy and Sustainability). 
              These Terms of Service ("Terms") govern your access to and use of our multi-generational financial 
              management platform and services. By accessing or using our services, you agree to be bound by these Terms.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">2. Acceptance of Terms</Title>
            <Text mb="md">
              By accessing or using FAMILyS services, you acknowledge that you have read, understood, and agree to 
              be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access 
              or use our services.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">3. Description of Services</Title>
            <Text mb="md">
              FAMILyS provides a comprehensive platform for multi-generational financial management, including but 
              not limited to financial planning, legacy management, asset tracking, and intergenerational wealth 
              transfer services. We reserve the right to modify, suspend, or discontinue any aspect of our services 
              at any time.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">4. User Accounts and Registration</Title>
            <Text mb="md">
              To access certain features of our services, you must register for an account. You agree to:
            </Text>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li><Text>Provide accurate, current, and complete information during registration</Text></li>
              <li><Text>Maintain and promptly update your account information</Text></li>
              <li><Text>Maintain the security of your account credentials</Text></li>
              <li><Text>Accept responsibility for all activities that occur under your account</Text></li>
              <li><Text>Notify us immediately of any unauthorized use of your account</Text></li>
            </ul>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">5. User Conduct</Title>
            <Text mb="md">You agree not to:</Text>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li><Text>Use our services for any illegal or unauthorized purpose</Text></li>
              <li><Text>Violate any applicable laws or regulations</Text></li>
              <li><Text>Infringe upon the rights of others</Text></li>
              <li><Text>Transmit any viruses, malware, or harmful code</Text></li>
              <li><Text>Attempt to gain unauthorized access to our systems or other users' accounts</Text></li>
              <li><Text>Interfere with or disrupt the integrity or performance of our services</Text></li>
            </ul>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">6. Financial Information and Data</Title>
            <Text mb="md">
              You are solely responsible for the accuracy and completeness of all financial information and data you 
              provide to FAMILyS. We are not responsible for any errors, omissions, or inaccuracies in the information 
              you provide. You acknowledge that financial decisions should be made in consultation with qualified 
              financial advisors.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">7. Intellectual Property</Title>
            <Text mb="md">
              All content, features, and functionality of our services, including but not limited to text, graphics, 
              logos, icons, images, and software, are the exclusive property of FAMILyS and are protected by 
              international copyright, trademark, and other intellectual property laws.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">8. Privacy and Data Protection</Title>
            <Text mb="md">
              Your use of our services is also governed by our Privacy Policy. Please review our Privacy Policy 
              to understand how we collect, use, and protect your personal and financial information.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">9. Fees and Payment</Title>
            <Text mb="md">
              Certain features of our services may require payment of fees. You agree to pay all applicable fees 
              as described in our service agreements. All fees are non-refundable unless otherwise stated. We 
              reserve the right to change our fee structure at any time with reasonable notice.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">10. Disclaimer of Warranties</Title>
            <Text mb="md">
              Our services are provided "as is" and "as available" without warranties of any kind, either express 
              or implied. We do not warrant that our services will be uninterrupted, secure, or error-free. We 
              disclaim all warranties, including but not limited to warranties of merchantability, fitness for a 
              particular purpose, and non-infringement.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">11. Limitation of Liability</Title>
            <Text mb="md">
              To the maximum extent permitted by law, FAMILyS shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred 
              directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting 
              from your use of our services.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">12. Indemnification</Title>
            <Text mb="md">
              You agree to indemnify, defend, and hold harmless FAMILyS, its officers, directors, employees, 
              and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) 
              arising out of or relating to your use of our services or violation of these Terms.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">13. Termination</Title>
            <Text mb="md">
              We may terminate or suspend your account and access to our services immediately, without prior notice, 
              for any reason, including but not limited to breach of these Terms. Upon termination, your right to 
              use our services will cease immediately.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">14. Governing Law</Title>
            <Text mb="md">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to 
              its conflict of law provisions. Any disputes arising from these Terms shall be subject to the exclusive 
              jurisdiction of the competent courts.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">15. Changes to Terms</Title>
            <Text mb="md">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes 
              by posting the updated Terms on our website and updating the "Last updated" date. Your continued use 
              of our services after such modifications constitutes acceptance of the updated Terms.
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">16. Contact Information</Title>
            <Text mb="md">
              If you have any questions about these Terms of Service, please contact us through our contact form 
              or at the contact information provided on our website.
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

