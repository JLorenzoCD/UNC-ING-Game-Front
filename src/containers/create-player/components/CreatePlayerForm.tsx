import useCreatePlayerForm from "./useCreatePlayerForm";

import quinAvatar from "@/assets/avatars/icono1.png";
import ladyAvatar from "@/assets/avatars/icono2.png";
import tuppenceAvatar from "@/assets/avatars/icono3.png";
import poirotAvatar from "@/assets/avatars/icono4.png";
import oliverAvatar from "@/assets/avatars/icono5.png";
import sattertwhiteAvatar from "@/assets/avatars/icono6.png";
import marpleAvatar from "@/assets/avatars/icono7.png";

import AlertErrorList from "@/components/AlertErrorList";
import Button from "@/components/Button";
import Input from "@/components/Input";

import type { PlayerInput } from "@/types/player";

const AVATARS_IMAGE_PATHS: { path: string; name: string }[] = [
  { path: quinAvatar, name: "Quin" },
  { path: ladyAvatar, name: "Lady" },
  { path: tuppenceAvatar, name: "Tuppence" },
  { path: poirotAvatar, name: "Harly Quinn" },
  { path: oliverAvatar, name: "Oliver" },
  { path: sattertwhiteAvatar, name: "Satterwhite" },
  { path: marpleAvatar, name: "Marple" },
];

interface PlayerFormProps {
  handleCreatePlayer: (playerData: PlayerInput) => Promise<void>;
}

export default function CreatePlayerForm({
  handleCreatePlayer,
}: PlayerFormProps) {
  const {
    formData,
    errors,
    handleChange,
    handleAvatarChange,
    handleSubmit,
    getInputErrorClassName,
    haveError,
    isSubmitting,
  } = useCreatePlayerForm();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 w-full max-w-2xl mt-[-250px]">
        <h2 className="text-xl font-bold text-black-900 mb-4 text-center">
          Create your player
        </h2>

        <form
          onSubmit={(e) => handleSubmit(e, handleCreatePlayer)}
          className="space-y-4"
        >
          {haveError && (
            <AlertErrorList
              title="There are errors in the form, please note the following:"
              errorList={Object.values(errors).map((err, index) => ({
                key: index,
                error: err,
              }))}
            />
          )}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-black-700 mb-1"
            >
              Nickname <span className="text-red-500">*</span>
            </label>

            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter nickname"
              className={getInputErrorClassName("name")}
            />
          </div>

          <div>
            <label
              htmlFor="birthday"
              className="block text-sm font-medium text-black-700 mb-1"
            >
              Birthday <span className="text-red-500">*</span>
            </label>

            <Input
              type="date"
              id="birthday"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              required
              className={getInputErrorClassName("birthday")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-700 mb-1">
              Avatar <span className="text-red-500">*</span>
            </label>

            <div className="flex flex-nowrap gap-2 justify-center items-center">
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
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || haveError}
              className="w-full"
            >
              {isSubmitting ? "Creating..." : "Create Player"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
