const FormRow = ({
  type,
  name,
  labelText,
  className,
  placeholder,
  value,
  handleChange,
  textArea,
  acceptProps,
}) => {
  return (
    <div className={`input_container `}>
      <label htmlFor={name} className="label_style">
        {labelText || name}
      </label>
      {textArea ? (
        <textarea
          name={name}
          type={type}
          id={name}
          value={value}
          onChange={handleChange}
          cols="30"
          rows="5"
          placeholder={placeholder || "Type here..."}
          className={`input_style resize-none `}
        ></textarea>
      ) : (
        <input
          id={name}
          placeholder={placeholder}
          type={type}
          name={name}
          value={value}
          accept={acceptProps}
          onChange={handleChange}
          className={`input_style ${className} `}
        />
      )}
    </div>
  )
}

export default FormRow
