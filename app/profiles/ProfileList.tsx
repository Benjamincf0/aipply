import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Context } from "../Context";
import { use } from "react";

export default function ProfileList() {
  const { state, dispatch } = use(Context);
  const profileSelected =
    state.selectedProfileId !== -1
      ? "Profile " + state.selectedProfileId
      : "Select Profile";

  function handleSelect(id: string) {
    dispatch({ type: "setSelectedProfileId", id: parseInt(id, 10) });
  }

  return (
    <Select onValueChange={handleSelect}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={profileSelected} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Profiles</SelectLabel>
          {state.profiles.map((profile) => (
            <SelectItem key={profile.id} value={profile.id.toString()}>
              Profile {profile.id}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
