import "./formik-demo.css";
import "./rich-editor.css";
import React from "react";
import { List, Map, Repeat, fromJS } from "immutable";
import { render } from "react-dom";
import { withFormik } from "formik";
import { EditorState } from "draft-js";
import { RichEditorExample } from "./RichEditor";
import { stateToHTML } from "draft-js-export-html";
import Yup from "yup";
import {
  convertToRaw,
  convertFromRaw,
  ContentState,
  ContentBlock,
  genKey,
  CharacterMetadata
} from "draft-js";
import parse from "html-react-parser";
import data from "./data";
import startCase from "lodash/startCase";

const toRaw = (list = []) => {
  return list.map(e => {
    const { key, value } = e;
    const isStringOrNumber = ["string", "number"].includes(typeof value);
    const stringValue = `${startCase(key)}: ${value}`;
    return {
      ...e,
      editorRawValue: {
        blocks: [
          new ContentBlock({
            key: genKey(),
            type: "unstyled",
            text: stringValue,
            characterList: List(
              Repeat(CharacterMetadata.create(), stringValue.length)
            ),
            im: fromJS([])
          })
        ],
        entityMap: {}
      }
    };
  });
};

const toRawList = toRaw(data);
const dataRaw = toRaw(data).reduce((acc, curr) => {
  const [first] = curr.editorRawValue.blocks;
  // console.log("@@@dataRaw", first.toJS());
  return [...acc, ...curr.editorRawValue.blocks];
}, []);

const shapeDataRaw = { blocks: dataRaw };
const input = ["a", "b", "c"];

// const newBlock =

const formikEnhancer = withFormik({
  mapPropsToValues: props => {
    const myRaw = {};
    // EditorState.createEmpty()

    const initialState = EditorState.createWithContent(
      ContentState.createFromBlockArray(dataRaw)
    );
    console.log("@@dataRaw", { shapeDataRaw, myRaw, initialState });
    return {
      editorState: initialState,
      email: ""
    };
  },
  validationSchema: Yup.object().shape({
    email: Yup.string()
      .email("That's not an email")
      .required("Required!")
  }),
  handleSubmit: (values, { setSubmitting }) => {
    setTimeout(() => {
      // you probably want to transform draftjs state to something else, but I'll leave that to you.
      alert(JSON.stringify(values, null, 2));
      setSubmitting(false);
    }, 1000);
  },
  displayName: "MyForm"
});

const MyForm = ({
  values,
  touched,
  dirty,
  errors,
  handleChange,
  handleBlur,
  handleSubmit,
  handleReset,
  setFieldValue,
  isSubmitting
}) => {
  const editorState = values.editorState; // immutable value
  const raw = convertToRaw(editorState.getCurrentContent());
  const inputValue = convertFromRaw(raw);
  const html = stateToHTML(editorState.getCurrentContent());
  const blocks = editorState
    .getCurrentContent()
    .getBlocksAsArray()
    .map(e => e.toJS());

  console.log({ raw, inputValue, blocks, html, editorState });

  return (
    <form onSubmit={handleSubmit}>
      <RichEditorExample
        editorState={editorState}
        onChange={setFieldValue}
        onBlur={handleBlur}
      />
      <h2>
        Parse HTML
        {parse(html)}
      </h2>
    </form>
  );
};

const MyEnhancedForm = formikEnhancer(MyForm);

// Helper styles for demo
import "./formik-demo.css";
import { MoreResources, DisplayFormikState } from "./formik-helper";

const App = () => (
  <div className="app">
    <MyEnhancedForm user={{ email: "hello@reason.nyc" }} />
  </div>
);

render(<App />, document.getElementById("root"));
