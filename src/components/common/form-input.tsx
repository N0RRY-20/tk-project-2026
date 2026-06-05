import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Field, FieldError, FieldLabel } from "../ui/field";

interface FormInputProps<
  TfieldValues extends FieldValues,
> extends React.ComponentPropsWithoutRef<typeof Input> {
  name: Path<TfieldValues>;
  control: Control<TfieldValues>;
  label: string;
  variant?: "input" | "textarea";
}

export function FormInput<TfieldValues extends FieldValues>({
  name,
  control,
  label,
  variant = "input",
  id,
  type,
  placeholder,
}: FormInputProps<TfieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const renderControl = () => {
          switch (variant) {
            case "textarea":
              return (
                <Textarea
                  {...field}
                  id={id || name}
                  aria-invalid={fieldState.invalid}
                />
              );
            default:
              return (
                <Input
                  {...field}
                  id={id || name}
                  aria-invalid={fieldState.invalid}
                  type={type}
                  placeholder={placeholder}
                />
              );
          }
        };
        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={id || name}>{label}</FieldLabel>
            {renderControl()}

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
