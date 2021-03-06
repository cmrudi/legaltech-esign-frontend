import React from "react";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    minHeight: "30vh",
    width: "100%",
    background: "transparent",
  },
}));

export default function LoadingBackdrop({ open = true }) {
  const classes = useStyles();

  return (
    <Backdrop className={classes.backdrop} open={open}>
      <CircularProgress color="primary" />
    </Backdrop>
  );
}
