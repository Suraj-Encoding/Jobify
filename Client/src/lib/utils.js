import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => {
    const cls = clsx(inputs);
    const twm = twMerge(cls);
    return twm;
};

export {
    cn
};
