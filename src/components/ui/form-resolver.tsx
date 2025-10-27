"use client";

import * as z from "zod";
import { useMemo, useState } from "react";
import { useForm, useFormContext, type SubmitHandler } from "react-hook-form";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import {
    AnyObj,
    FormElement,
    InputElement,
    InputType,
    FieldType,
    FormField as FormFieldType,
    FormGroupType,
    EventHandler,
} from "../../types";
import {
    resolveBinding,
    classesFromStyleProps,
    getAccessibilityProps, cn,
    deepResolveBindings,
    resolveDataSourceValue
} from "../../lib/utils";

import { Button, ButtonRenderer } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "../../components/ui/select";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "../../components/ui/form";
import { Slider } from "../../components/ui/slider";
import { Multiselect, type MultiSelectOption } from "../../components/ui/multiselect";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./input-otp";
import { Calendar } from "./calendar";
import { CreateSelect, CreateSelectOption } from "./create-select";
import { CreditCardInput } from "./credit-cart-input";
import { RatingInput } from "./rating-input";
import { SignatureInput } from "./signature-input";
import { TagsInput } from "./tags-input";
import { RichTextEditor } from "./richtext-input";
import { CodeInput } from "./code-input";
import { MarkdownInput } from "./markdown-input";
import { CurrencyInput } from "./currency-input";
import { TabGroup, WizardGroup } from "./form-group";
import { FileUpload } from "./file-upload";
import { useStepperDataProvider, useStepperGuard } from "../../hooks/StepperContext";
import { zodResolver } from "@hookform/resolvers/zod";
type SelectOption = { value: string; label: string };
function luhnCheck(cardNumber: string): boolean {
    const sanitized = cardNumber.replace(/\D/g, "");
    if (!sanitized.length) return false;
    let sum = 0;
    let shouldDouble = false;

    for (let i = sanitized.length - 1; i >= 0; i--) {
        let digit = parseInt(sanitized.charAt(i), 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
}

const numberCoerce = (val: unknown) => {
    if (val === "" || val === null || val === undefined) return undefined;
    if (typeof val === "number") return val;
    const n = Number(val);
    return Number.isNaN(n) ? val : n;
};

function Heading({ text, className }: { text: string; className?: string }) {
    return <h2 className={cn("text-lg font-semibold", className)}>{text}</h2>;
}

function Subheading({ text, className }: { text: string; className?: string }) {
    return <h3 className={cn("text-md font-medium", className)}>{text}</h3>;
}

function Description({ text, className }: { text: string; className?: string }) {
    return <p className={cn("text-sm text-muted-foreground", className)}>{text}</p>;
}

function HelpMessage({ text, className }: { text: string; className?: string }) {
    return <p className={cn("text-xs text-muted-foreground italic", className)}>{text}</p>;
}

function Divider({ className }: { className?: string }) {
    return <div className={cn("border-t my-6", className)} />;
}

function ContainerWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("space-y-4 p-4", className)}>{children}</div>;
}

function CardWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("rounded-md p-6 space-y-4", className)}>{children}</div>;
}

interface FormResolverProps {
    element: FormElement;
    onFormSubmit?: (data: Record<string, any>) => void;
    onFormCancel?: () => void;
    state: AnyObj;
    t: (key: string, defaultLabel?: string) => string;
    runEventHandler?: (handler?: EventHandler | undefined, dataOverride?: AnyObj) => Promise<void>

}
const trimString = z.string().transform(v => (v ?? '').trim());
export function FormResolverStepBridge({ stepIndex }: { stepIndex: number }) {
    const form = useFormContext()

    // 1) Guard: block Next if invalid (validate visible fields if you want)
    useStepperGuard(stepIndex, async () => {
        const ok = await form.trigger() // or trigger(['name','email']) if you map from schema
        return ok
    })

    // 2) Data provider: provide values to the wizard final submit
    useStepperDataProvider(stepIndex, () => form.getValues())

    return null // no UI; just registers behavior
}
export function FormResolver({ element, state, t, runEventHandler, onFormSubmit }: FormResolverProps) {
    const formSchema = useMemo(() => {
        const shape: Record<string, z.ZodTypeAny> = {};

        for (const f of element.formFields) {
            if (f.fieldType !== FieldType.input) continue;
            const input = f.input as InputElement;

            const err = (msg: string) =>
                t((input.validation?.errorMessage as string) || msg);

            switch (input.inputType) {
                case InputType.text:
                case InputType.password:
                case InputType.textarea: {
                    let s: any = trimString;
                    if (input.validation?.required)
                        s = s.refine((v: any) => v.length > 0, { message: err("field_required") });

                    if (input.validation?.regex)
                        s = s.regex(new RegExp(input.validation.regex), { message: err("invalid_format") });
                    shape[input.name] = s;
                    break;
                }
                case InputType.email: {
                    let s: any = trimString;

                    // Prefer the new helper if present; otherwise fall back to classic method
                    const emailCheck =
                        (z as any).email
                            ? (z as any).email({ message: err("invalid_email") })
                            : z.string().email({ message: err("invalid_email") });

                    // Pipe the trimmed value into the email validator
                    s = s.pipe(emailCheck);

                    if (input.validation?.required)
                        s = s.refine((v: any) => v.length > 0, { message: err("field_required") });

                    shape[input.name] = s;
                    break;
                }
                case InputType.number: {
                    let s: any = z.preprocess(numberCoerce, z.number());
                    if (input.validation?.required)
                        s = s.refine((val: any) => val !== undefined, { message: err("field_required") });
                    if (input.validation?.max !== undefined)
                        s = s.max(input.validation.max, { message: err("too_large") });
                    shape[input.name] = s;
                    break;
                }

                case InputType.checkbox: {
                    let v = z.boolean();
                    if (input.validation?.required)
                        v = v.refine((val) => val === true, err("must_be_checked"));
                    shape[input.name] = v;
                    break;
                }

                case InputType.select: {
                    let s = z.string();
                    if (input.validation?.required) s = s.min(1, err("field_required"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.multiselect: {
                    let s = z.array(z.string());
                    if (input.validation?.required) s = s.min(1, err("field_required"));
                    shape[input.name] = s;
                    break;
                }
                case InputType.image: {
                    let v = z
                        .any()
                        .refine(
                            (val) =>
                                val == null ||
                                (Array.isArray(val) &&
                                    val.every((v) => v instanceof File && v.type.startsWith("image/"))),
                            t("invalid_image_input")
                        );
                    if (input.validation?.required)
                        v = v.refine(
                            (val) => Array.isArray(val) && val.length > 0,
                            t("image_required")
                        );
                    shape[input.name] = v;
                    break;
                }

                case InputType.range: {
                    let s = z.number();
                    if (input.validation?.min !== undefined)
                        s = s.min(input.validation.min, err("too_small"));
                    if (input.validation?.max !== undefined)
                        s = s.max(input.validation.max, err("too_large"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.search: {
                    let s = z.string();
                    if (input.validation?.required) s = s.min(1, err("field_required"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.slider: {
                    let s = z.number();
                    if (input.validation?.min !== undefined)
                        s = s.min(input.validation.min, err("too_small"));
                    if (input.validation?.max !== undefined)
                        s = s.max(input.validation.max, err("too_large"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.file: {
                    // We keep files as File[] (from react-dropzone)
                    let v = z
                        .any()
                        .refine(
                            (val) =>
                                val == null ||
                                (Array.isArray(val) && val.every((v) => v instanceof File)),
                            t("invalid_file_input")
                        );
                    if (input.validation?.required)
                        v = v.refine(
                            (val) => Array.isArray(val) && val.length > 0,
                            t("file_required")
                        );
                    shape[input.name] = v;
                    break;
                }
                case InputType.date:
                case InputType.datetime_local:
                case InputType.time:
                case InputType.month:
                case InputType.week: {
                    let s = z.string(); // ISO string
                    if (input.validation?.required) s = s.min(1, err("field_required"));
                    shape[input.name] = s;
                    break;
                }
                case InputType.otp: {
                    let s = z.string();
                    if (input.validation?.required) s = s.min(1, err("otp_required"));
                    shape[input.name] = s;
                    break;
                }
                case InputType.voice: {
                    let s = z.string();
                    if (input.validation?.required) s = s.min(1, t("voice_input_required"));
                    shape[input.name] = s;
                    break;
                }
                case InputType.radio: {
                    let s = z.string();
                    if (input.validation?.required) s = s.min(1, err("field_required"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.url: {
                    let s = z.string().url(err("invalid_url"));
                    if (input.validation?.required) s = s.min(1, err("field_required"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.tel: {
                    let s = z.string().regex(/^\+?[0-9\s\-()]+$/, err("invalid_phone"));
                    if (input.validation?.required) s = s.min(1, err("field_required"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.color: {
                    let s = z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, err("invalid_color"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.toggle:
                case InputType.switch: {
                    let s = z.boolean();
                    if (input.validation?.required)
                        s = s.refine((val) => val === true, err("must_be_checked"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.rating: {
                    let s = z.number().min(0).max(5);
                    if (input.validation?.required)
                        s = s.refine((val) => val > 0, err("rating_required"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.signature: {
                    let s = z.string(); // base64 or URL to signature image
                    if (input.validation?.required) s = s.min(1, err("signature_required"));
                    shape[input.name] = s;
                    break;
                }
                case InputType.credit_card: {
                    let s = z.string()
                        .regex(/^\d{13,19}$/, err("invalid_card_number"))
                        .refine((val) => luhnCheck(val), err("invalid_card_number"));
                    shape[input.name] = s;
                    break;
                }
                case InputType.richtext:
                case InputType.code:
                case InputType.markdown: {
                    let s = z.string();
                    if (input.validation?.required) s = s.min(1, err("field_required"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.tags: {
                    let s = z.array(z.string());
                    if (input.validation?.required) s = s.min(1, err("tags_required"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.currency: {
                    let s = z.number();
                    if (input.validation?.min !== undefined) s = s.min(input.validation.min, err("too_small"));
                    if (input.validation?.max !== undefined) s = s.max(input.validation.max, err("too_large"));
                    shape[input.name] = s;
                    break;
                }

                default:
                    shape[input.name] = z.any();
            }

        }

        return z.object(shape);
    }, [element.formFields, t]);


    const defaultValues = useMemo(() => {
        const vals: AnyObj = {};
        for (const f of element.formFields) {
            if (f.fieldType !== FieldType.input) continue;
            const input = f.input as InputElement;
            let def: any = resolveBinding(input.value, state, t);

            switch (input.inputType) {
                case InputType.checkbox:
                    def = Boolean(def);
                    break;
                case InputType.number:
                    def = numberCoerce(def);
                    break;
                case InputType.file:
                    def = [];
                    break;
                case InputType.multiselect:
                    def = Array.isArray(def) ? def : [];
                    break;
                case InputType.slider: {
                    const min = input.min ?? 0;
                    def = typeof def === "number" ? def : min;
                    break;
                }
                default:
                    if (def === undefined || def === null) def = "";
            }
            vals[input.name] = def;
        }
        return vals as FormValues;
    }, [element.formFields, state, t]);

    type FormValues = z.infer<typeof formSchema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
        mode: "onSubmit",
    });
    const [isSubmitting, setSubmitting] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        if (onFormSubmit) {
            onFormSubmit(data);
        } else {
            setSubmitting(true);
            setError(null);
            try {
                await runEventHandler?.(element.submit?.onClick, data);
            } catch (e: any) {
                setError(String(e.message || e));
            } finally {
                setSubmitting(false);
            }
        }
    };

    const renderField = (f: FormFieldType) => {
        if (f.fieldType === FieldType.input) {
            return renderInputField(f.input);
        }
        if (!f.element) {
            return null;
        }

        switch (f.fieldType) {
            case FieldType.heading:
                return <Heading key={f.id} text={resolveBinding(f.element?.name, state, t)} />;
            case FieldType.subheading:
                return <Subheading key={f.id} text={resolveBinding(f.element?.name, state, t)} />;
            case FieldType.description:
                return <Description key={f.id} text={resolveBinding(f.element?.name, state, t)} />;
            case FieldType.help:
                return <HelpMessage key={f.id} text={resolveBinding(f.element?.name, state, t)} />;
            case FieldType.divider:
                return <Divider key={f.id} />;
            case FieldType.card:
                return <CardWrapper key={f.id}>{f.element?.children?.map(renderField as any)}</CardWrapper>;
            default:
                return null;
        }
    };

    const renderInputField = (input: InputElement) => {
        const name = input.name as keyof FormValues;
        const commonProps = {
            className: classesFromStyleProps(input.styles),
            disabled: input.disabled,
            ...getAccessibilityProps(input.accessibility),
        };
        return (
            <FormField
                key={input.id}
                control={form.control}
                name={name}
                render={({ field: formField }) => {
                    const label =
                        input.label != null ? resolveBinding(input.label, state, t) : null;
                    const placeholder = resolveBinding(input.placeholder, state, t);
                    const error = form.formState.errors[name];
                    const inputClass = cn(
                        "border rounded-md px-3 py-2 w-full transition-colors",
                        error ? "border-red-500 focus-visible:ring-red-500" : "border-input focus-visible:ring-ring",
                        classesFromStyleProps(input.styles)
                    );
                    return (
                        <FormItem className={'space-y-2 w-full px-3 py-2'}>
                            {label && <FormLabel>{label}</FormLabel>}
                            <FormControl>
                                {(() => {
                                    switch (input.inputType) {
                                        case InputType.number: {
                                            return (
                                                <Input
                                                    type="number"
                                                    placeholder={placeholder}
                                                    value={
                                                        formField.value === undefined || formField.value === null
                                                            ? ""
                                                            : String(formField.value)
                                                    }
                                                    onChange={(e) =>
                                                        formField.onChange(numberCoerce(e.target.value))
                                                    }
                                                    inputMode="decimal"
                                                    min={input.min}
                                                    max={input.max}
                                                    step={input.step}
                                                    {...commonProps}
                                                    className={inputClass}
                                                />
                                            );
                                        }

                                        case InputType.textarea: {
                                            return <Textarea
                                                placeholder={placeholder}
                                                value={(formField.value as string) ?? ""}
                                                onChange={formField.onChange}
                                                rows={input.rows ?? 3} // optional support if schema has it
                                                {...commonProps}
                                                className={inputClass}
                                            />;
                                        }

                                        case InputType.checkbox: {
                                            return (
                                                <Checkbox
                                                    checked={Boolean(formField.value)}
                                                    onCheckedChange={(checked) =>
                                                        formField.onChange(Boolean(checked))
                                                    }
                                                    {...commonProps}
                                                    className={inputClass}
                                                />
                                            );
                                        }

                                        case InputType.select: {
                                            const options: SelectOption[] =
                                                (deepResolveBindings(input.options, state, t) as
                                                    | SelectOption[]
                                                    | undefined) || [];
                                            return (
                                                <Select
                                                    value={(formField.value as string) ?? ""}
                                                    onValueChange={(v) => formField.onChange(v)}
                                                    {...commonProps}
                                                >
                                                    <SelectTrigger className={cn(
                                                        " min-w-sm",
                                                        inputClass
                                                    )}
                                                        disabled={commonProps.disabled}>
                                                        <SelectValue placeholder={placeholder} />
                                                    </SelectTrigger>
                                                    <SelectContent className={cn(
                                                        "z-50 bg-background text-foreground shadow-md border border-border rounded-md min-w-sm",
                                                        input.styles?.className
                                                    )}>
                                                        {options?.map((opt) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            );
                                        }

                                        case InputType.multiselect: {
                                            const options: MultiSelectOption[] =
                                                (deepResolveBindings(input.options, state, t) as
                                                    | MultiSelectOption[]
                                                    | undefined) || [];
                                            return (
                                                <Multiselect
                                                    options={options}
                                                    value={(formField.value as string[]) || []}
                                                    onChange={(vals) => formField.onChange(vals)}
                                                    placeholder={placeholder}
                                                    {...commonProps}
                                                    className={inputClass}
                                                />
                                            );
                                        }

                                        case InputType.slider: {
                                            const min = input.min ?? 0;
                                            const max = input.max ?? 100;
                                            const step = input.step ?? 1;

                                            const current = (formField.value as number) ?? min;

                                            return (
                                                <div className="flex flex-col gap-2">
                                                    <Slider
                                                        defaultValue={[current]}
                                                        min={min}
                                                        max={max}
                                                        step={step}
                                                        onValueChange={(vals) => formField.onChange(vals[0])}
                                                        {...commonProps}
                                                        className={inputClass}
                                                    />
                                                    <div className="text-xs text-muted-foreground">
                                                        {current}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        case InputType.file:
                                        case InputType.image: {
                                            return (
                                                <FileUpload
                                                    multiple={!!input.multiple}
                                                    accept={input.accept}
                                                    maxSize={input.maxSize}
                                                    files={(formField.value as File[]) || []}
                                                    onFiles={(files) => formField.onChange(files)}
                                                    disabled={input.disabled}
                                                    presignUrl={resolveDataSourceValue(input.uploadUrl, state, undefined)}
                                                />
                                            );
                                        }

                                        case InputType.voice: {
                                            const {
                                                transcript,
                                                listening,
                                                resetTranscript,
                                                browserSupportsSpeechRecognition,
                                            } = useSpeechRecognition();

                                            const start = () => {
                                                resetTranscript();
                                                SpeechRecognition.startListening({
                                                    continuous: true,
                                                    language: "en-US",
                                                });
                                            };
                                            const stop = () => {
                                                SpeechRecognition.stopListening();
                                                formField.onChange(transcript);
                                            };

                                            if (!browserSupportsSpeechRecognition) {
                                                return (
                                                    <div className="text-sm text-muted-foreground">
                                                        {t("voice_not_supported")}
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            variant={listening ? "destructive" : "outline"}
                                                            onClick={listening ? stop : start}
                                                        >
                                                            {listening ? t("stop_recording") : t("start_recording")}
                                                        </Button>
                                                        {formField.value ? (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    resetTranscript();
                                                                    formField.onChange("");
                                                                }}
                                                            >
                                                                {t("clear")}
                                                            </Button>
                                                        ) : null}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {transcript || t("voice_input_placeholder")}
                                                    </div>
                                                    <input
                                                        type="hidden"
                                                        value={(formField.value as string) ?? ""}
                                                        readOnly
                                                    />
                                                </div>
                                            );
                                        }
                                        case InputType.date: {
                                            const value = formField.value ? new Date(formField.value as string) : undefined;
                                            return (
                                                <Calendar
                                                    mode="single"
                                                    selected={value}
                                                    {...commonProps}
                                                    className={inputClass}
                                                    onSelect={(date) =>
                                                        formField.onChange(date ? date.toISOString().split("T")[0] : "")
                                                    }
                                                />
                                            );
                                        }

                                        case InputType.datetime_local: {
                                            return (
                                                <Input
                                                    type="datetime-local"
                                                    {...commonProps}
                                                    className={inputClass}
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                />
                                            );
                                        }

                                        case InputType.time: {
                                            return (
                                                <Input
                                                    type="time"
                                                    {...commonProps}
                                                    className={inputClass}
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                />
                                            );
                                        }

                                        case InputType.month: {
                                            return (
                                                <Input
                                                    {...commonProps}
                                                    className={inputClass}
                                                    type="month"
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                />
                                            );
                                        }

                                        case InputType.week: {
                                            return (
                                                <Input
                                                    {...commonProps}
                                                    className={inputClass}
                                                    type="week"
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                />
                                            );
                                        }

                                        case InputType.radio: {
                                            const options: SelectOption[] =
                                                (deepResolveBindings(input.options, state, t) as SelectOption[]) || [];
                                            return (
                                                <div className="space-y-2">
                                                    {options?.map((opt) => (
                                                        <label key={opt.value} className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name={name as string}
                                                                value={opt.value}
                                                                {...commonProps}
                                                                checked={formField.value === opt.value}
                                                                onChange={() => formField.onChange(opt.value)}
                                                            />
                                                            {opt.label}
                                                        </label>
                                                    ))}
                                                </div>
                                            );
                                        }

                                        case InputType.color: {
                                            return (
                                                <Input
                                                    type="color"
                                                    {...commonProps}
                                                    value={(formField.value as string) ?? "#000000"}
                                                    onChange={formField.onChange}
                                                />
                                            );
                                        }

                                        case InputType.toggle:
                                        case InputType.switch: {
                                            return (
                                                <Checkbox
                                                    {...commonProps}
                                                    className={inputClass}
                                                    checked={Boolean(formField.value)}
                                                    onCheckedChange={(checked) => formField.onChange(Boolean(checked))}
                                                />
                                            );
                                        }


                                        case InputType.rating:
                                            return <RatingInput value={(formField.value as any) ?? 0} onChange={formField.onChange} />;

                                        case InputType.signature:
                                            return <SignatureInput value={formField.value as string} onChange={formField.onChange} />;

                                        case InputType.tags:
                                            return <TagsInput value={formField.value as string[] ?? []} onChange={formField.onChange} />;

                                        case InputType.credit_card:
                                            return <CreditCardInput value={formField.value as string ?? ""} onChange={formField.onChange} />;

                                        case InputType.image: {
                                            return (
                                                <FileUpload
                                                    multiple={!!input.multiple}
                                                    accept="image/*"
                                                    maxSize={input.maxSize}
                                                    files={(formField.value as File[]) || []}
                                                    onFiles={(files) => formField.onChange(files)}
                                                    disabled={input.disabled}
                                                    presignUrl={input.uploadUrl}
                                                />
                                            );
                                        }

                                        case InputType.range: {
                                            const min = input.min ?? 0;
                                            const max = input.max ?? 100;
                                            const step = input.step ?? 1;
                                            const current = (formField.value as number) ?? min;
                                            return (
                                                <input
                                                    type="range"
                                                    {...commonProps}
                                                    className={inputClass}
                                                    min={min}
                                                    max={max}
                                                    step={step}
                                                    value={current}
                                                    onChange={(e) => formField.onChange(Number(e.target.value))}
                                                />
                                            );
                                        }

                                        case InputType.search: {
                                            return (
                                                <Input
                                                    type="search"
                                                    placeholder={placeholder}
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                    {...commonProps}
                                                    className={inputClass}
                                                />
                                            );
                                        }

                                        case InputType.richtext:
                                            return (
                                                <RichTextEditor
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                    placeholder={placeholder}
                                                    {...commonProps}
                                                    className={inputClass}
                                                />
                                            );

                                        case InputType.code:
                                            return (
                                                <CodeInput
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                    placeholder={placeholder}
                                                    {...commonProps}
                                                    className={inputClass}
                                                />
                                            );
                                        case InputType.markdown:
                                            return (
                                                <MarkdownInput
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                    placeholder={placeholder}
                                                    {...commonProps}
                                                    className={inputClass}
                                                />
                                            );
                                        case InputType.currency: {
                                            return (
                                                <CurrencyInput
                                                    value={(formField.value as number | undefined)}
                                                    onChange={(num) => formField.onChange(num)}
                                                    placeholder={placeholder ?? "0.00"}
                                                    {...commonProps}
                                                    // Optional: pass locale/currency from schema if you have them
                                                    // locale={resolveBinding(input.locale, state, t) as string | undefined}
                                                    currency={resolveBinding(input.currency, state, t) as string | undefined}
                                                    minFractionDigits={input.minFractionDigits || 2}
                                                    maxFractionDigits={input.maxFractionDigits || 2}
                                                    className={inputClass}
                                                />
                                            );
                                        }
                                        case InputType.otp: {
                                            return (
                                                <InputOTP
                                                    maxLength={6}
                                                    value={formField.value as string}
                                                    onChange={formField.onChange}
                                                    {...commonProps}
                                                    className={inputClass}
                                                >
                                                    <InputOTPGroup>
                                                        {Array.from({ length: 6 })?.map((_, i) => (
                                                            <InputOTPSlot key={i} index={i} />
                                                        ))}
                                                    </InputOTPGroup>
                                                </InputOTP>
                                            );
                                        }
                                        case InputType.createselect: {
                                            const options: CreateSelectOption[] =
                                                (deepResolveBindings(input.options, state, t) as CreateSelectOption[]) || [];

                                            return (
                                                <CreateSelect
                                                    value={(formField.value as string) ?? ""}
                                                    options={options}
                                                    placeholder={placeholder}
                                                    onChange={(val) => formField.onChange(val)}
                                                    onCreateAction={input.onCreate}
                                                    {...commonProps}
                                                    className={inputClass}
                                                />
                                            );
                                        }

                                        default:
                                            return (
                                                <Input
                                                    type={input.inputType}
                                                    {...commonProps}
                                                    onBlur={(e) => {
                                                        const v = e.target.value.trim();
                                                        if (v !== e.target.value) {
                                                            e.target.value = v;
                                                            form.trigger(name as any);
                                                        }
                                                    }}
                                                    placeholder={placeholder}
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                    className={inputClass}
                                                />
                                            );
                                    }
                                })()}
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    );
                }}
            />
        );
    };

    const renderGroup = (group: FormElement) => {

        switch (group.formGroupType) {
            case FormGroupType.card:
                return (
                    <CardWrapper key={group.id}>
                        {group.formFields?.map(renderField)}
                    </CardWrapper>
                );

            case FormGroupType.container:
                return (
                    <ContainerWrapper key={group.id}>
                        {group.formFields?.map(renderField)}
                    </ContainerWrapper>
                );

            case FormGroupType.tabs:
                return (
                    <TabGroup
                        key={group.id}
                        state={state} t={t}
                        group={group}
                        form={form}
                        renderField={renderField}
                    />
                );

            case FormGroupType.step_wizard:
                return (
                    <WizardGroup
                        state={state} t={t}
                        key={group.id}
                        group={group}
                        form={form}
                        renderField={renderField}
                    />
                );

            default:
                return <div key={group.id} className="space-y-6">{group.formFields?.map(renderField)}</div>;
        }
    };
    const className = classesFromStyleProps(element.styles);
    const renderContent = () => {

        // Case 1: element is a group (card, container, tabs, wizard, etc.)
        if (element.formGroupType) {
            return renderGroup(element);
        }

        // Case 2: element has formFields directly (normal form)
        if (element.formFields) {
            return (
                <div className="space-y-6">
                    {element.formFields?.map(renderField)}
                </div>
            );
        }

        return null;
    };
    const submitAccProps = element.submit ? getAccessibilityProps(element.submit.accessibility) : {};
    const submitClassName = element.submit ? classesFromStyleProps(element.submit.styles) : '';
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={className}
            >
                {renderContent()}
                <div className="flex flex-col items-center justify-center pt-6 mt-8 border-t border-border space-y-4">
                    {element.formGroupType !== "step_wizard" && element.submit && (
                        <Button type="submit" disabled={isSubmitting} className={submitClassName} {...submitAccProps}>
                            {isSubmitting ? t("Submitting", "Submitting") : resolveBinding(element.submit.text, state, t)}
                        </Button>
                    )}
                    {element.actions?.length ? (
                        <div className="flex flex-wrap justify-center gap-3 pt-2">
                            {element.actions?.map((act, index) => (
                                <ButtonRenderer
                                    key={`${act.id}_${index}`} element={act}
                                    runEventHandler={runEventHandler}
                                    state={state}
                                    t={t} />
                            ))}
                        </div>) : null}
                </div>
            </form>
        </Form>
    );
}