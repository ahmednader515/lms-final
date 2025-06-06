import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface VerificationEmailProps {
  verificationUrl: string;
  userName: string;
}

export const VerificationEmail = ({
  verificationUrl,
  userName,
}: VerificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>تحقق من بريدك الإلكتروني</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>مرحباً {userName}</Heading>
          <Text style={text}>
            شكراً لتسجيلك في منصتنا. يرجى النقر على الرابط أدناه للتحقق من بريدك الإلكتروني:
          </Text>
          <Link href={verificationUrl} style={button}>
            تحقق من البريد الإلكتروني
          </Link>
          <Text style={text}>
            إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد الإلكتروني.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  direction: 'rtl' as const,
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#000',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
  margin: '24px auto',
  width: '200px',
};

export default VerificationEmail; 