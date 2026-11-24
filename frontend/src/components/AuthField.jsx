export default function AuthField({ label, name, error, Icon, ...props }) {
  return (
    <div className="mb-5">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="absolute top-3.5 left-3.5 text-slate-400"
          />
        )}
        <input
          className={
            "form-control " +
            (Icon ? "!pl-10 " : "") +
            (error ? "!border-rose-300 focus:!ring-rose-50" : "")
          }
          id={name}
          name={name}
          aria-invalid={!!error}
          aria-describedby={error ? name + "-error" : undefined}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-rose-600" id={name + "-error"}>
          {error}
        </p>
      )}
    </div>
  );
}
