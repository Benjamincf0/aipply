import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { use, useCallback, useRef, useState } from "react";
import { Context, Profile } from "../Context";

type NewProfileProps = {
  pdfUrl: string;
  setPdfUrl: (url: string) => void;
};

export default function NewProfile({ pdfUrl, setPdfUrl }: NewProfileProps) {
  const { state, dispatch } = use(Context);
  const selectedProfile = state.profiles.find(
    (p) => p.id === state.selectedProfileId,
  );

  const file = useRef<File>(null);
  const [showMore, setShowMore] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      const profile: Omit<Profile, "id"> = {
        firstName: formData.get("firstName")!.toString() || "",
        lastName: formData.get("lastName")!.toString() || "",
        email: formData.get("email")!.toString() || "",
        phone: formData.get("phone")!.toString() || "",
        resume: file.current || selectedProfile?.resume!,
        country: formData.get("country")?.toString(),
        city: formData.get("city")?.toString(),
        state: formData.get("state")?.toString(),
        address: formData.get("address")?.toString(),
        zip: formData.get("zip")?.toString(),
        about: formData.get("about")?.toString(),
      };

      if (selectedProfile) {
        dispatch({
          type: "updateProfile",
          profileId: selectedProfile.id,
          profile: { ...profile, id: selectedProfile.id },
        });
      } else {
        dispatch({ type: "addProfile", profile });
      }

      e.currentTarget.reset();
      setPdfUrl("");
      file.current = null;
    },
    [selectedProfile],
  );

  return (
    <div className="flex w-full flex-1 flex-col items-start gap-2 overflow-x-hidden overflow-y-auto p-2">
      <form className="flex w-xl flex-col gap-4" onSubmit={handleSubmit}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>New Profile</FieldLegend>
            <FieldDescription>
              Create a new profile for your job applications.
            </FieldDescription>

            <Field>
              <FieldLabel htmlFor="resume">Upload Resume*</FieldLabel>
              <Input
                id="resume"
                name="resume"
                required={!selectedProfile}
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];

                  if (f) {
                    file.current = f;
                    const url = URL.createObjectURL(f);
                    setPdfUrl(url);
                    return () => URL.revokeObjectURL(url);
                  }
                }}
              />
            </Field>
            <div className="flex w-full gap-2">
              <Field>
                <FieldLabel htmlFor="firstName">First Name*</FieldLabel>
                <Input
                  id="firstName"
                  name="firstName"
                  // required
                  placeholder="John"
                  defaultValue={selectedProfile?.firstName}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="lastName">Last Name*</FieldLabel>
                <Input
                  id="lastName"
                  name="lastName"
                  // required
                  placeholder="Doe"
                  defaultValue={selectedProfile?.lastName}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="email">Email*</FieldLabel>
              <Input
                id="email"
                name="email"
                // required
                placeholder="john.doe@example.com"
                type="email"
                defaultValue={selectedProfile?.email}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Phone (+# ### ###-####)*</FieldLabel>
              <Input
                id="phone"
                name="phone"
                // required
                type="tel"
                placeholder="+1 (555) 555-5555"
                pattern="^\+[0-9]{1,2} [0-9]{3} [0-9]{3}-[0-9]{4}$"
                defaultValue={selectedProfile?.phone}
              />
            </Field>

            <div
              className={
                "sr:w-auto flex w-full flex-col gap-3" +
                (showMore ? "" : " hidden")
              }
            >
              <div className="flex w-full flex-col gap-2">
                <Field>
                  <FieldLabel htmlFor="country">Country</FieldLabel>
                  <Input
                    id="country"
                    name="country"
                    placeholder="United States"
                    type="text"
                    defaultValue={selectedProfile?.country}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="city">City</FieldLabel>
                  <Input
                    id="city"
                    name="city"
                    placeholder="New York"
                    type="text"
                    defaultValue={selectedProfile?.city}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="state">State</FieldLabel>
                  <Input
                    id="state"
                    name="state"
                    placeholder="NY"
                    type="text"
                    defaultValue={selectedProfile?.state}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="address">Address</FieldLabel>
                  <Input
                    id="address"
                    name="address"
                    placeholder="123 Main St"
                    type="text"
                    defaultValue={selectedProfile?.address}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="zip">Zip</FieldLabel>
                  <Input
                    id="zip"
                    name="zip"
                    placeholder="12345"
                    type="text"
                    defaultValue={selectedProfile?.zip}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="about">About</FieldLabel>
                <Textarea
                  id="about"
                  name="about"
                  placeholder="I am a software engineer"
                  defaultValue={selectedProfile?.about}
                />
              </Field>
              <Button onClick={() => setShowMore(false)} variant="ghost">
                Show Less
              </Button>
            </div>
            {!showMore && (
              <Button onClick={() => setShowMore(true)} variant="ghost">
                Show More
              </Button>
            )}
          </FieldSet>
        </FieldGroup>
        <Button type="submit">
          {selectedProfile ? "Update Profile" : "Create Profile"}
        </Button>
      </form>
    </div>
  );
}
