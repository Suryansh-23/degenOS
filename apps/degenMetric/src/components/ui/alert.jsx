export function Alert({ className, ...props }) {
    return (
        <div
            role="alert"
            className={`relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7 ${className}`}
            {...props}
        />
    );
}

export function AlertDescription({ className, ...props }) {
    return (
        <div
            className={`text-sm [&_p]:leading-relaxed ${className}`}
            {...props}
        />
    );
}
