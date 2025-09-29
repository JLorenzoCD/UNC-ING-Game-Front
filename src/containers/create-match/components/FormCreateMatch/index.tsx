import { Link } from "react-router";

import Button from "@/components/Button";
import Input from "@/components/Input";
import AlertErrorList from "../AlertErrorList";

import useFormCreateMatch from "./useFormCreateMatch";

import { RANGE_PLAYERS } from "./constants";
import { FRONTEND_PATHS } from "@/constants/frontendPaths";

import type { Match, MatchCreateInput } from "@/types/match";

interface Props {
  handleCreateMatch: (matchToCreate: MatchCreateInput) => Promise<Match>;
}

function FormCreateMatch({ handleCreateMatch }: Props) {
  const {
    formData,
    handleChange,
    formError,
    haveError,
    createHandleSubmit,
    loading,
  } = useFormCreateMatch();

  return (
    <form
      onSubmit={createHandleSubmit(handleCreateMatch)}
      className="bg-white rounded-xl p-6 max-w-3xl mx-auto"
      role="form"
    >
      <h1 className="text-center text-4xl font-bold">Create match</h1>
      <hr className="my-2" />
      <section className="mb-5">
        {haveError && (
          <AlertErrorList
            title="There are errors in the form, please note the following:"
            errorList={Object.values(formError).map((err, index) => ({
              key: index,
              error: err,
            }))}
          />
        )}
        <label className="block my-5 font-medium">
          <span className={formError.name ? "text-red-800" : ""}>
            Name of the match
          </span>{" "}
          <span className="text-amber-600">*</span>
          <Input
            value={formData.name}
            onChange={handleChange}
            name="name"
            type="text"
            placeholder="The best room on the server"
            required
          />
        </label>
        <div className="grid sm:grid-cols-2 sm:gap-6">
          <label className="block mb-2 font-medium">
            <span className={formError.min_players ? "text-red-800" : ""}>
              Minimum number of desired players
            </span>
            <Input
              value={formData.min_players}
              onChange={handleChange}
              name="min_players"
              type="number"
              min={RANGE_PLAYERS.MIN}
              max={RANGE_PLAYERS.MAX}
              placeholder={`default ${RANGE_PLAYERS.MIN}`}
            />
          </label>
          <label className="block mb-2 font-medium">
            <span className={formError.max_players ? "text-red-800" : ""}>
              Maximum number of desired players
            </span>
            <Input
              value={formData.max_players}
              onChange={handleChange}
              name="max_players"
              type="number"
              min={RANGE_PLAYERS.MIN}
              max={RANGE_PLAYERS.MAX}
              placeholder={`default ${RANGE_PLAYERS.MAX}`}
            />
          </label>
        </div>
      </section>
      <div className="flex gap-2">
        <Link to={FRONTEND_PATHS.MATCH_LIST} className="flex-grow">
          <Button type="button" className="w-full" data-testid="cancel">
            Cancel
          </Button>
        </Link>
        <Button type="submit" className="flex-grow" disabled={!!haveError}>
          {loading ? "Loading..." : "Create"}
        </Button>
      </div>
    </form>
  );
}

export default FormCreateMatch;
