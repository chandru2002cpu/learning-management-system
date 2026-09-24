function SelectInput({ label, error, id, children, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
          error ? 'border-rose-400' : 'border-slate-300'
        }`}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="mt-1 text-sm text-rose-600">{error}</p> : null}
    </div>
  )
}

export default SelectInput
