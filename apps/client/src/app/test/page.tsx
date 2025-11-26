import { auth } from "@clerk/nextjs/server";

const TestPage = async () => {
  const { getToken } = await auth();
  const resProduct = await fetch("http://localhost:8000/api/test", {
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });
  const resOrder = await fetch("http://localhost:8001/api/test", {
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });
  const resPayment = await fetch("http://localhost:8002/api/test", {
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });

  if (!resProduct.ok) {
    const errorText = await resProduct.text();
    return (
      <pre>
        Error: {resProduct.status} - {errorText}
      </pre>
    );
  }
  if (!resOrder.ok) {
    const errorText = await resOrder.text();
    return (
      <pre>
        Error: {resOrder.status} - {errorText}
      </pre>
    );
  }
  if (!resPayment.ok) {
    const errorText = await resPayment.text();
    return (
      <pre>
        Error: {resPayment.status} - {errorText}
      </pre>
    );
  }

  const dataProduct = await resProduct.json();
  const dataOrder = await resOrder.json();
  const dataPayment = await resPayment.json();

  return (
    <pre>
      {JSON.stringify(dataProduct, null, 2)}
      {JSON.stringify(dataOrder, null, 2)}
      {JSON.stringify(dataPayment, null, 2)}
    </pre>
  );
};

export default TestPage;
