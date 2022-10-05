import { Box, Button, Container, Snackbar, TextField, Typography } from '@material-ui/core';
import { useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import * as emailAnimation from './mail.json';
import emailjs from '@emailjs/browser';

import { config } from '../utils/config';

import './contact.scss';

interface IFormData {
  userName: string;
  message: string;
  userEmail: string;
}

export const Contact: React.FC = () => {
  const [showSnak, setShowSnak] = useState(false);
  const [formData, setFormData] = useState<IFormData>({
    userName: '',
    message: '',
    userEmail: '',
  });
  const [errors, setErrors] = useState({
    userName: false,
    message: false,
    userEmail: false,
  });
  const [sent, setSent] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    const name = e.target.name;
    setErrors((prev) => ({
      ...prev,
      [name]: false,
    }));

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isValidData = () => {
    let result = true;
    for (const key in formData) {
      if (!formData[key as keyof IFormData].trim()) {
        result = false;
        setErrors((prev) => ({
          ...prev,
          [key]: true,
        }));
      }
    }
    return result;
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!isValidData()) return;

    try {
      await emailjs.send('tulenova_contact', 'tulenova_template', { ...formData }, config.emailJStoken);
      setSent(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  const handleEmailClick = () => {
    navigator.clipboard.writeText('miratulenova@gmail.com');
    setShowSnak(true);
  };

  return (
    <Container maxWidth="md" className="contact-container">
      {!sent && (
        <>
          <Typography variant="h3" onClick={handleEmailClick} className="contact-mail-link">
            Click to copy email address,
            <br />
            or use the form below
          </Typography>
          <form className="contact-form" noValidate autoComplete="off" onSubmit={handleSubmit}>
            <TextField
              value={formData.userName}
              label="Your Name"
              name="userName"
              variant="outlined"
              required
              fullWidth
              margin="normal"
              onChange={handleInputChange}
              error={errors.userName}
              helperText={errors.userName ? 'Please state your Name' : null}
            />
            <TextField
              value={formData.userEmail}
              label="Your Email"
              name="userEmail"
              variant="outlined"
              required
              fullWidth
              margin="normal"
              onChange={handleInputChange}
              error={errors.userEmail}
              helperText={errors.userEmail ? 'Please enter your email address' : null}
            />
            <TextField
              value={formData.message}
              label="Message"
              name="message"
              variant="outlined"
              rows={4}
              required
              fullWidth
              multiline
              margin="normal"
              onChange={handleInputChange}
              error={errors.message}
              helperText={errors.message ? "Don't forget to write your message" : null}
            />
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button variant="contained" type="submit" color="secondary">
                Send
              </Button>
            </Box>
          </form>
        </>
      )}
      {sent && (
        <>
          <Player autoplay loop src={emailAnimation} style={{ height: '50vh' }} />
          <Typography variant="h3">Thank you!</Typography>
        </>
      )}
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        open={showSnak}
        autoHideDuration={2000}
        message="Added to the clipboard"
        onClose={() => setShowSnak(false)}
      />
    </Container>
  );
};
