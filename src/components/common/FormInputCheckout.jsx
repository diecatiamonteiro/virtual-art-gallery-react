export default function FormInputCheckout({
  type = "text",
  placeholder,
  defaultValue,
  required = false,
  maxLength,
  className = "",
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue}
      required={required}
      maxLength={maxLength}
      className={`w-full p-2 border rounded ${className}`}
    />
  );
}
