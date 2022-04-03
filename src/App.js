import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  List,
  Row,
  Table,
} from "reactstrap";
import {
  createTransaction,
  deleteTransaction,
  getUserData,
  listenTransactions,
  signInFirebase,
  updateTransaction,
} from "./firebase/FireBase"

const transactionTypes = [
  {
    label: "Income",
    value: "income",
  },
  {
    label: "Expenses",
    value: "expenses",
  },
];

const TransactionSchema = Yup.object().shape({
  title: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  amount: Yup.number().required("Required"),
  type: Yup.string().required("Required"),
});
const SignInSchema = Yup.object().shape({
  email: Yup.string().email().required("Required"),
  password: Yup.string().required("Required"),
});

const App = () => {
  const [user, setUser] = useState(null);

  const [list, setList] = useState([]);
  const [listObj, setListObj] = useState({});
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const onSubmit = (variables) => {
    console.log("submit called");
    if (selectedTransaction) {
      updateTransaction(
        selectedTransaction,
        variables?.title,
        variables?.amount,
        variables?.type
      );
      setSelectedTransaction(null);
    } else {
      createTransaction(variables?.title, variables?.amount, variables?.type);
    }
  };

  const calculateCurrentBalance = () => {
    let total = 0;
    Object.keys(listObj).map((key) => {
      if (listObj[key]?.type === "income") {
        total += listObj[key]?.amount;
      } else {
        total -= listObj[key]?.amount;
      }
    });
    return total;
  };

  const clcTotalIncome = () => {
    let total = 0;
    Object.keys(listObj).map((key) => {
      if (listObj[key]?.type === "income") {
        total += listObj[key]?.amount;
      }
    });
    return total;
  };

  const clcTotalExpense = () => {
    let total = 0;
    Object.keys(listObj).map((key) => {
      if (listObj[key]?.type === "expenses") {
        total += listObj[key]?.amount;
      }
    });
    return total;
  };

  const listenerCallbackFn = (data) => {
    setListObj(data);
  };

  const onSignIn = (variables) => {
    signInFirebase(variables?.email, variables?.password);
  };

  useEffect(() => {
    setUser(getUserData());
    listenTransactions(listenerCallbackFn);
  }, []);

  return (
    <Container>
      <Row className="mt-4">
        <p>Current user: {user?.currentUser?.email}</p>
        <Col>
          <Card>
            <CardTitle>
              Current Balance: {calculateCurrentBalance()} $
            </CardTitle>
          </Card>
        </Col>
        <Col>
          <Card>
            <CardTitle>Total Income: {clcTotalIncome()} $</CardTitle>
          </Card>
        </Col>
        <Col>
          <Card>
            <CardTitle>Total Expenses: {clcTotalExpense()} $</CardTitle>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <Formik
            initialValues={{ title: "", amount: "", type: "income" }}
            validationSchema={TransactionSchema}
            onSubmit={onSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
              /* and other goodies */
            }) => (
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="exampleEmail">Title</Label>
                  <Input
                    type="text"
                    name="title"
                    placeholder="Title"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.title}
                    invalid={errors.title && touched.title}
                  />
                  {errors.title && touched.title && (
                    <FormFeedback>{errors?.title}</FormFeedback>
                  )}
                </FormGroup>
                <FormGroup>
                  <Label for="exampleEmail">Amount</Label>
                  <Input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.amount}
                    invalid={errors.amount && touched.amount}
                  />
                  {errors.amount && touched.amount && (
                    <FormFeedback tooltip>{errors?.amount}</FormFeedback>
                  )}
                </FormGroup>
                <FormGroup>
                  <Label for="exampleSelect" sm={2}>
                    Type
                  </Label>
                  <Input
                    id="exampleSelect"
                    type="select"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.type}
                    name="type"
                    invalid={errors.type && touched.type}
                  >
                    {transactionTypes?.map((option) => (
                      <option key={option?.value} value={option?.value}>
                        {option?.label}
                      </option>
                    ))}
                  </Input>
                  {errors.type && touched.type && (
                    <FormFeedback tooltip>{errors?.type}</FormFeedback>
                  )}
                </FormGroup>
                <Button type="submit">
                  {" "}
                  {selectedTransaction ? "Edit" : "Submit"}
                </Button>
              </Form>
            )}
          </Formik>
        </Col>
        <Col>
          <Card>
            <CardBody>
              <Table dark>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(listObj).map((key) => (
                    <tr key={key}>
                      <td>{listObj[key]?.title}</td>
                      <td>{listObj[key]?.amount}</td>
                      <td>{listObj[key]?.type}</td>
                      <td>
                        <Button onClick={() => deleteTransaction(key)}>
                          Delete
                        </Button>
                        <Button onClick={() => setSelectedTransaction(key)}>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
      {!user && (
        <Row className="mt-4">
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={SignInSchema}
            onSubmit={onSignIn}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
              /* and other goodies */
            }) => (
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="exampleEmail">Email</Label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                    invalid={errors.email && touched.email}
                  />
                  {errors.email && touched.email && (
                    <FormFeedback>{errors?.email}</FormFeedback>
                  )}
                </FormGroup>
                <FormGroup>
                  <Label for="exampleEmail">Password</Label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                    invalid={errors.password && touched.password}
                  />
                  {errors.password && touched.password && (
                    <FormFeedback tooltip>{errors?.password}</FormFeedback>
                  )}
                </FormGroup>
                <Button type="submit">
                  {" "}
                  {selectedTransaction ? "Edit" : "Submit"}
                </Button>
              </Form>
            )}
          </Formik>
        </Row>
      )}
    </Container>
  );
};

export default App;

/*
{
  132312.123123: {
    title: "Bils",
    amount: 120,
    type: "expense"
  }
}
[
  {
    title: "",
    amount: "",
    type: ""
  },
  {
    title: "",
    amount: "",
    type: ""
  },
  {
    title: "",
    amount: "",
    type: ""
  }
]
{
  transaction1: {
    title: "",
    amount: "",
    type: ""
  },
  transaction2: {
    title: "",
    amount: "",
    type: ""
  },
   transaction3: {
    title: "",
    amount: "",
    type: ""
  },
   transaction4: {
    title: "",
    amount: "",
    type: ""
  },
}
 
*/
