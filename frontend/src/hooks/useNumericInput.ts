import { useState } from "react";

export const useNumericInput = (initialValue: number | string = "") => {
  const [value, setValue] = useState<string>(String(initialValue));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    if (/^0+\d/.test(val)) {
      val = val.replace(/^0+/, "");
    }

    setValue(val);
  };

  return { value, setValue, handleChange };
};


