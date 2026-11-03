/**
 * Safely format a phone number to WhatsApp international standard.
 * For Bangladesh numbers (e.g. 01305612767), automatically ensures international prefix 8801305612767.
 * Handles existing +880, 880, dashes, spaces, and clean formatting.
 */
export const formatWhatsAppNumber = (phone?: string): string => {
  if (!phone) return '8801305612767';
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('01') && clean.length === 11) {
    clean = '88' + clean;
  }
  return clean;
};

export const getWhatsAppUrl = (phone?: string, text?: string): string => {
  const number = formatWhatsAppNumber(phone);
  const textParam = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${number}${textParam}`;
};
