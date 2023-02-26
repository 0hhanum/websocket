import styled from "styled-components";

const Container = styled.div`
  height: 100% !important;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default function ProgressComponent() {
  return (
    <Container>
      <svg
        version="1.1"
        id="L4"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        width={50}
        height={50}
        viewBox="0 0 80 50"
        enableBackground="new 0 0 0 0"
        xmlSpace="preserve"
      >
        <circle fill="#fff" stroke="none" cx="20" cy="25" r="6">
          <animate
            attributeName="opacity"
            dur="1s"
            values="0;1;0"
            repeatCount="indefinite"
            begin="0.1"
          />
        </circle>
        <circle fill="#fff" stroke="none" cx="40" cy="25" r="6">
          <animate
            attributeName="opacity"
            dur="1s"
            values="0;1;0"
            repeatCount="indefinite"
            begin="0.2"
          />
        </circle>
        <circle fill="#fff" stroke="none" cx="60" cy="25" r="6">
          <animate
            attributeName="opacity"
            dur="1s"
            values="0;1;0"
            repeatCount="indefinite"
            begin="0.3"
          />
        </circle>
      </svg>
    </Container>
  );
}
