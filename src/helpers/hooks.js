import { useState, useEffect, useRef } from "react";
import { BREAKPOINT_WIDTH, PROGRESS_BAR_INTERVAL } from "./constant";
import { useLocation } from "react-router-dom";

export const useInput = (initialValue) => {
  const [value, setValue] = useState(initialValue);
  return { value, set: setValue };
};
export const useRefreshedData = (updatingValue) => {
  const [value, setValue] = useState(updatingValue);
  useEffect(() => {
    if (
      updatingValue !== null &&
      updatingValue !== "" &&
      updatingValue !== undefined
    )
      setValue(updatingValue);
  }, [updatingValue]);
  return { value, set: setValue };
};

export const useCheckbox = (initialValue = false) => {
  const [checked, setChecked] = useState(initialValue);
  return { checked, onChange: () => setChecked((a) => !a) };
};

export const useFormInput = (initialValue) => {
  const [value, setValue] = useState(initialValue);
  // const [isTouched, setIsTouched] = useState(false);
  // const [errorClassName, setErrorClassName] = useState("");
  const handleChange = (e) => {
    setValue(e.target.value);
    // setIsTouched(true);
  };

  useEffect(() => {
    if (
      initialValue !== null &&
      initialValue !== "" &&
      initialValue !== undefined
    )
      setValue(initialValue);
  }, [initialValue]);
  // useEffect(() => {
  //   if (isTouched && value === "") {
  //     setErrorClassName("form-error");
  //   } else {
  //     setErrorClassName("");
  //   }
  // }, [isTouched, value]);
  return { value, onChange: handleChange };
};

export const useFile = () => {
  const [file, setFile] = useState(null);
  const filePicker = useRef(null);

  const handleUploadFile = (e) => {
    if (e?.target?.files) {
      if (e?.target?.files[0]) {
        setFile(e.target.files[0]);
      }
    }
  };

  return {
    file,
    setFile,
    filePicker,
    onChange: handleUploadFile,
  };
};

export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

export const useWidth = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width]);
  return width;
};

export const useIsLargeScreen = () => {
  const width = useWidth();
  return width > BREAKPOINT_WIDTH;
};

export const useProgressBar = () => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      if (value !== 99) {
        setValue(value + 1);
      }
    };
    if (value > 0 && value < 100) {
      const id = setInterval(updateProgress, PROGRESS_BAR_INTERVAL);
      return () => clearInterval(id);
    }
  }, [value]);

  return { value, set: setValue };
};

export const useLocationChanged = (callback) => {
  const location = useLocation();
  useEffect(() => {
    callback();
  }, [location, callback]);
};

export const usePreventPageLeave = () => {
  useEffect(() => {
    const give = (window.onload = () => {
      window.onbeforeunload = (e) => {
        var confirmationMessage = "";

        let result = window.confirm(confirmationMessage);

        if (result) {
          if (window.confirm("Do you really want to leave?")) {
            window.open("exit.html", "Thanks for Visiting!");
          }
        }

        (e || window.event).returnValue = confirmationMessage;
        return confirmationMessage;
      };
    });
    give();
    return () => give();
  }, []);
};

export const useHashString = (defaultValue = "", type = "string") => {
  const location = useLocation();
  if (type === "number")
    return location?.hash
      ? parseInt(String(location.hash).substr(1))
      : defaultValue;
  return location?.hash ? String(location.hash).substr(1) : defaultValue;
};

export const useQuery = (atr) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  return searchParams.get(atr);
};
