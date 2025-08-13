import { Alert } from 'react-native';
import { setLoading } from '../../App'; // Adjust path as needed

export const handleError = (error: any, message: string = 'An unexpected error occurred.') => {
  console.error(message, error);
  Alert.alert('Error', message + (error.message ? `\n\n${error.message}` : ''));
};

export const showSuccessToast = (message: string) => {
  // In a real app, you'd use a proper toast library (e.g., react-native-toast-message)
  // For now, we'll use Alert for simplicity, but it's not ideal for toasts.
  console.log('Success:', message);
  Alert.alert('Success', message);
};

export const showLoadingIndicator = (isLoading: boolean) => {
  setLoading(isLoading);
};
