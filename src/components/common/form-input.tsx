import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Field, FieldError, FieldLabel } from "../ui/field";

interface SelectOption {
  value: string;
  label: string;
}

interface FormInputProps<
  TfieldValues extends FieldValues,
> extends React.ComponentPropsWithoutRef<typeof Input> {
  name: Path<TfieldValues>;
  control: Control<TfieldValues>;
  label: string;
  variant?: "input" | "textarea" | "select";
  selectOptions?: SelectOption[];
  selectPlaceholder?: string;
}

export function FormInput<TfieldValues extends FieldValues>({
  name,
  control,
  label,
  variant = "input",
  selectOptions = [],
  selectPlaceholder,
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
            case "select":
              return (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {selectOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
            {variant === "select" ? (
              <FieldLabel>{label}</FieldLabel>
            ) : (
              <FieldLabel htmlFor={id || name}>{label}</FieldLabel>
            )}
            {renderControl()}

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
