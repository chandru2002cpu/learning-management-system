function SubmitButton({ children, loading = false, ...props }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
      {...props}
    >
      {loading ? 'Please wait...' : children}
    </button>
  )
}

export default SubmitButton
