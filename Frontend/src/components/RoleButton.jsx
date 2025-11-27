import React from "react";

export default function RoleButton({title, subtitle,onClick,dataTestId}){
    return(
        <button 
        data-testid={dataTestId}
        onClick={onClick}
        className="w-full md:w-72 p-6 rounded-2xl shadow-lg border hover:shadow-xl transition flex-col gap-3 text-left bg-white">
            <div className="text-xl font-semibold">{title}</div>
            <div className="text-sm text-gray-600">{subtitle}</div>
        </button>
    );
}