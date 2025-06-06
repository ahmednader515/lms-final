import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface OtpEmailProps {
  otp: string;
  userName: string;
}

export const OtpEmail = ({
  otp,
  userName,
}: OtpEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>رمز التحقق الخاص بك</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>مرحباً {userName}</Heading>
          <Text style={text}>
            شكراً لتسجيلك في منصتنا. استخدم الرمز التالي للتحقق من بريدك الإلكتروني:
          </Text>
          <div style={otpContainer}>
            <Text style={otpText}>{otp}</Text>
          </div>
          <Text style={text}>
            هذا الرمز صالح لمدة 10 دقائق فقط.
          </Text>
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

const otpContainer = {
  backgroundColor: '#f4f4f4',
  borderRadius: '4px',
  margin: '24px auto',
  padding: '16px',
  textAlign: 'center' as const,
  width: '200px',
};

const otpText = {
  color: '#000',
  fontSize: '32px',
  fontWeight: 'bold',
  letterSpacing: '4px',
  margin: '0',
  textAlign: 'center' as const,
};

export default OtpEmail; 