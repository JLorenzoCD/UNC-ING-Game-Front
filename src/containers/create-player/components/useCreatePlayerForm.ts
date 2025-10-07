import { useState } from "react";

import type { PlayerInput } from "@/types/player";

interface PlayerData {
  name: string;
  avatar: string;
  birthday: string;
}

const validateName = (name: string): string => {
  if (!name.trim()) {
    return "The nickname is required";
  }

  if (name.includes(" ")) {
    return "The nickname must not contain spaces";
  }

  return "";
};

const validateBirthday = (dateString: string): string => {
  if (!dateString) {
    return "The birthdate is required";
  }

  const age = Math.floor(
    (new Date().getTime() - new Date(dateString).getTime()) /
      (1000 * 60 * 60 * 24 * 365.25),
  );

  if (age < 5 || age > 110) {
    return "The birthdate must be between 5 and 110 years ago";
  }

  return "";
};

const validateAvatar = (avatar: string): string => {
  if (!avatar.trim()) {
    return "The avatar is required";
  }

  return "";
};

const validateField = (name: string, value: string): string => {
  switch (name) {
    case "name":
      return validateName(value);
    case "birthday":
      return validateBirthday(value);
    case "avatar":
      return validateAvatar(value);
    default:
      return "";
  }
};

export default function useCreatePlayerForm() {
  const [formData, setFormData] = useState<PlayerData>({
    name: "",
    avatar: "",
    birthday: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Validar el campo al instante
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    // Actualizar el estado del formulario
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (url: string) => {
    // Validar el campo de avatar al seleccionarlo
    const error = validateField("avatar", url);
    setErrors((prev) => ({
      ...prev,
      avatar: error,
    }));

    setFormData((prev) => ({
      ...prev,
      avatar: url,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof PlayerData]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    handleCreatePlayer: (playerData: PlayerInput) => Promise<void>,
  ) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newPlayer: PlayerInput = {
        name: formData.name,
        avatar: formData.avatar,
        birthday: new Date(formData.birthday),
      };

      await handleCreatePlayer(newPlayer);

      setFormData({
        name: "",
        avatar: "",
        birthday: "",
      });

      setErrors({});
    } catch (error) {
      console.error("Error submitting form:", error);

      alert("Failed to create player. Please check your input and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputErrorClassName = (fieldName: string) => {
    const errorClasses = errors[fieldName]
      ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
      : "";

    return errorClasses;
  };

  const haveError = Object.values(errors).some((error) => error !== "");

  return {
    handleChange,
    handleAvatarChange,
    handleSubmit,
    getInputErrorClassName,
    isSubmitting,
    errors,
    formData,
    haveError,
  };
}
