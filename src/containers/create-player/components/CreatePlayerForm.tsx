import { useState } from "react";

import type { PlayerInput } from "@/types/player";
import quinAvatar from "@/assets/avatars/icono1.png";
import ladyAvatar from "@/assets/avatars/icono2.png";
import tuppenceAvatar from "@/assets/avatars/icono3.png";
import poirotAvatar from "@/assets/avatars/icono4.png";
import oliverAvatar from "@/assets/avatars/icono5.png";
import sattertwhiteAvatar from "@/assets/avatars/icono6.png";
import marpleAvatar from "@/assets/avatars/icono7.png";

const AVATARS_IMAGE_PATHS: { path: string; name: string }[] = [
  { path: quinAvatar, name: "Quin" },
  { path: ladyAvatar, name: "Lady" },
  { path: tuppenceAvatar, name: "Tuppence" },
  { path: poirotAvatar, name: "Harly Quinn" },
  { path: oliverAvatar, name: "Oliver" },
  { path: sattertwhiteAvatar, name: "Satterwhite" },
  { path: marpleAvatar, name: "Marple" },
];

interface PlayerData {
  name: string;
  avatar: string;
  birthday: string;
};

interface PlayerFormProps {
  handleCreatePlayer: (playerData: PlayerInput) => Promise<void>;
}

export default function CreatePlayerForm({ handleCreatePlayer }: PlayerFormProps) {
  const [formData, setFormData] = useState<PlayerData>({
    name: "",
    avatar: "",
    birthday: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
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
              htmlFor="name"
              className="block text-sm font-medium text-black-700 dark:text-black-300 mb-1"
            >
              Nickname <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={getInputClassName("name")}
              placeholder="Enter nickname"
            />

            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="birthday"
              className="block text-sm font-medium text-black-700 dark:text-black-300 mb-1"
            >
              Birthday <span className="text-red-500">*</span>
            </label>

            <input
              type="date"
              id="birthday"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              required
              className={getInputClassName("birthday")}
            />

            {errors.birthday && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.birthday}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black-700 dark:text-black-300 mb-1">
              Avatar <span className="text-red-500">*</span>
            </label>

            <div className="flex flex-nowrap gap-2">
              {AVATARS_IMAGE_PATHS.map((avatar) => (
                <img
                  key={avatar.path}
                  src={avatar.path}
                  alt={`Avatar: ${avatar.name}`}
                  title={avatar.name}
                  className={`w-16 h-16 rounded-full cursor-pointer object-cover transition-transform transform hover:scale-110 ${
                    formData.avatar === avatar.path
                      ? "border-4 border-blue-500"
                      : "border-4 border-transparent"
                  }`}
                  onClick={() => handleAvatarChange(avatar.path)}
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
                isSubmitting || Object.keys(errors).some((key) => errors[key])
              }
              className="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Creating..." : "Create Player"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
