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

export default function NewProfile() {
  const { dispatch } = use(Context);

  const file = useRef<File>(null);
  const [showMore, setShowMore] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const profile: Omit<Profile, "id"> = {
      firstName: formData.get("firstName")!.toString(),
      lastName: formData.get("lastName")!.toString(),
      email: formData.get("email")!.toString(),
      phone: formData.get("phone")!.toString(),
      resume: file.current!,
      country: formData.get("country")?.toString(),
      city: formData.get("city")?.toString(),
      state: formData.get("state")?.toString(),
      address: formData.get("address")?.toString(),
      zip: formData.get("zip")?.toString(),
      about: formData.get("about")?.toString(),
    };

    dispatch({ type: "addProfile", profile });

    e.currentTarget.reset();
    file.current = null;
  }, []);

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
                required
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];

                  if (f) {
                    file.current = f;
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
                  required
                  placeholder="John"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="lastName">Last Name*</FieldLabel>
                <Input
                  id="lastName"
                  name="lastName"
                  required
                  placeholder="Doe"
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="email">Email*</FieldLabel>
              <Input
                id="email"
                name="email"
                required
                placeholder="john.doe@example.com"
                type="email"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Phone (+# ### ###-####)*</FieldLabel>
              <Input
                id="phone"
                name="phone"
                required
                type="tel"
                placeholder="+1 (555) 555-5555"
                pattern="^\+[0-9]{1,2} [0-9]{3} [0-9]{3}-[0-9]{4}$"
              />
            </Field>
            {showMore ? (
              <>
                <div className="flex w-full flex-col gap-2">
                  <Field>
                    <FieldLabel htmlFor="country">Country</FieldLabel>
                    <Input
                      id="country"
                      name="country"
                      placeholder="United States"
                      type="text"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="city">City</FieldLabel>
                    <Input
                      id="city"
                      name="city"
                      placeholder="New York"
                      type="text"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="state">State</FieldLabel>
                    <Input
                      id="state"
                      name="state"
                      placeholder="NY"
                      type="text"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="address">Address</FieldLabel>
                    <Input
                      id="address"
                      name="address"
                      placeholder="123 Main St"
                      type="text"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="zip">Zip</FieldLabel>
                    <Input
                      id="zip"
                      name="zip"
                      placeholder="12345"
                      type="text"
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="about">About</FieldLabel>
                  <Textarea
                    id="about"
                    name="about"
                    placeholder="I am a software engineer"
                  />
                </Field>
                <Button onClick={() => setShowMore(false)} variant="ghost">
                  Show Less
                </Button>
              </>
            ) : (
              <Button onClick={() => setShowMore(true)} variant="ghost">
                Show More
              </Button>
            )}
          </FieldSet>
        </FieldGroup>
        <Button type="submit">Create Profile</Button>
      </form>
    </div>
  );
}
