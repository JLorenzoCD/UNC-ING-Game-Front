import React, { useState } from 'react';

const avatars = [
  '/avatars/icono1.png',
  '/avatars/icono2.png',
  '/avatars/icono3.png',
  '/avatars/icono4.png',
  '/avatars/icono5.png',
  '/avatars/icono6.png',
  '/avatars/icono7.png'
];

interface FormData {
  nickname: string;
  birthdate: string;
  avatar: string;
}

interface PlayerFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
}

const PlayerForm: React.FC<PlayerFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    nickname: '',
    birthdate: '',
    avatar: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'nickname':
        return !value.trim() ? 'El nickname es obligatorio' : '';
      case 'birthdate':
        return !value ? 'La fecha de nacimiento es obligatoria' : '';
      case 'avatar':
        return !value.trim() ? 'El avatar es obligatorio' : '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Validar el campo al instante
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));

    // Actualizar el estado del formulario
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (url: string) => {
    // Validar el campo de avatar al seleccionarlo
    const error = validateField('avatar', url);
    setErrors(prev => ({
      ...prev,
      avatar: error,
    }));

    setFormData(prev => ({
      ...prev,
      avatar: url,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      setFormData({
        nickname: '',
        birthdate: '',
        avatar: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to create player. Please check your input and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (fieldName: string) => {
    const baseClasses =
      "w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors";
    const errorClasses = errors[fieldName]
      ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400";
    return `${baseClasses} ${errorClasses}`;
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white dark:bg-black-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-600 w-full max-w-2xl mt-[-250px]">
        <h2 className="text-xl font-bold text-black-900 dark:text-black mb-4 text-center">
          Create your player
        </h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-black-700 dark:text-black-300 mb-1"
            >
              Nickname *
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              required
              className={getInputClassName('nickname')}
              placeholder="Enter nickname"
            />
            {errors.nickname && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.nickname}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="birthdate"
              className="block text-sm font-medium text-black-700 dark:text-black-300 mb-1"
            >
              Birthdate *
            </label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              required
              className={getInputClassName('birthdate')}
            />
            {errors.birthdate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.birthdate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black-700 dark:text-black-300 mb-1">
              Avatar *
            </label>
            <div className="flex flex-nowrap gap-2">
              {avatars.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="Player Avatar"
                  className={`w-16 h-16 rounded-full cursor-pointer object-cover transition-transform transform hover:scale-110 ${
                    formData.avatar === url
                      ? 'border-4 border-blue-500'
                      : 'border-4 border-transparent'
                  }`}
                  onClick={() => handleAvatarChange(url)}
                />
              ))}
            </div>
            {errors.avatar && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.avatar}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                Object.keys(errors).some(key => errors[key])
              }
              className="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Player'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerForm;