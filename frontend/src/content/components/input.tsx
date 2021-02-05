import React from 'react';

export interface IInputProblem { inputid: string, msg: string, inputValue: string }

export const emptyInputProblem = { inputid: "", msg: "", inputValue: "" };

export function Input (props: {
    inputid: string,
    children: any,
    problemWithInput: IInputProblem,
    setProblemWithInput: React.Dispatch<React.SetStateAction<IInputProblem>>
}) {

    let isProblem = props.problemWithInput.inputid === props.inputid;

    if (isProblem && props.children.props.value !== props.problemWithInput.inputValue) {
        isProblem = false;
        if (props.children.props.type === "password") {
            setTimeout(() => {
                props.setProblemWithInput({ inputid: "", msg: "", inputValue: "" });
            }, 0);
        }
    }

    return (
        <div className={(isProblem) ? "input-invalid" : ""}>
            { props.children }
            <span>{(isProblem) ? props.problemWithInput.msg : ""}</span>
        </div>
    )
    
}