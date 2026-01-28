export const notify = (enqueueSnackbar, message, status = 200) => {
  let variant = "default";
  if (status >= 500) variant = "error";
  else if (status >= 400) variant = "warning";
  else if (status >= 200) variant = "success";

  enqueueSnackbar(message, { variant });
};
