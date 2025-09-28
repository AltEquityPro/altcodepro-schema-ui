"use client";

import { useMemo } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

import {
    AnyObj,
    FormElement,
    InputElement,
    UIElement,
    InputType,
    FieldType,
    FormField as FormFieldType,
    FormGroupType,
} from "../../types";
import { useAppState } from "../../schema/StateContext";
import { useActionHandler } from "../../schema/Actions";
import { resolveBinding, classesFromStyleProps, luhnCheck } from "../../lib/utils";

import { Button } from "../../components/ui/button";
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

/** ---------- Helpers ---------- */
type SelectOption = { value: string; label: string };

const numberCoerce = (val: unknown) => {
    if (val === "" || val === null || val === undefined) return undefined;
    if (typeof val === "number") return val;
    const n = Number(val);
    return Number.isNaN(n) ? val : n;
};

/** ---------- UI-Only Elements ---------- */
function Heading({ text }: { text: string }) {
    return <h2 className="text-2xl font-semibold">{text}</h2>;
}
function Subheading({ text }: { text: string }) {
    return <h3 className="text-lg font-medium text-muted-foreground">{text}</h3>;
}
function Description({ text }: { text: string }) {
    return <p className="text-sm text-muted-foreground">{text}</p>;
}
function Divider() {
    return <div className="my-4 border-t border-border" />;
}
function HelpMessage({ text }: { text: string }) {
    return <p className="text-xs text-muted-foreground italic">{text}</p>;
}
function ContainerWrapper({ children }: { children: React.ReactNode }) {
    return <div className="grid gap-4">{children}</div>;
}
function CardWrapper({ children }: { children: React.ReactNode }) {
    return <div className="rounded-lg border bg-card p-4 shadow-sm">{children}</div>;
}
interface FormResolverProps {
    element: FormElement;
    defaultData?: Record<string, any>;
    onFormSubmit?: (data: Record<string, any>) => void;
}
export function FormResolver({ element, defaultData, onFormSubmit }: FormResolverProps) {
    const { state, t } = useAppState();
    const { runEventHandler } = useActionHandler({ runtime: {} as any });

    const formSchema = useMemo(() => {
        const shape: Record<string, z.ZodTypeAny> = {};

        for (const f of element.formFields) {
            if (f.fieldType !== FieldType.input) continue;
            const input = f.input as InputElement;

            const err = (msg: string) =>
                t((input.validation?.errorMessage as string) || msg);

            switch (input.inputType) {
                case InputType.text:
                case InputType.email:
                case InputType.password:
                case InputType.textarea: {
                    let s = z.string()
                    if (input.validation?.required) s = s.min(1, err("field_required"));
                    if (input.validation?.regex)
                        s = s.regex(new RegExp(input.validation.regex), err("invalid_format"));
                    if (input.validation?.min !== undefined)
                        s = s.min(input.validation.min, err("too_short"));
                    if (input.validation?.max !== undefined)
                        s = s.max(input.validation.max, err("too_long"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.number: {
                    let s: any = z.preprocess(numberCoerce, z.number());
                    if (input.validation?.required)
                        s = s.refine((val: any) => val !== undefined, err("field_required"));
                    if (input.validation?.min !== undefined)
                        s = s.min(input.validation.min, err("too_small"));
                    if (input.validation?.max !== undefined)
                        s = s.max(input.validation.max, err("too_large"));
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


    const defaultValues = defaultData ? defaultData : useMemo(() => {
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

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        if (onFormSubmit) {
            onFormSubmit(data);
        } else {
            runEventHandler(element.onSubmit, data as AnyObj);
        }
    };

    const renderField = (f: FormFieldType) => {
        if (f.fieldType === FieldType.input) {
            return renderInputField(f.input);
        }

        switch (f.fieldType) {
            case FieldType.heading:
                return <Heading key={f.id} text={resolveBinding(f.element.name, state, t)} />;
            case FieldType.subheading:
                return <Subheading key={f.id} text={resolveBinding(f.element.name, state, t)} />;
            case FieldType.description:
                return <Description key={f.id} text={resolveBinding(f.element.name, state, t)} />;
            case FieldType.help:
                return <HelpMessage key={f.id} text={resolveBinding(f.element.name, state, t)} />;
            case FieldType.divider:
                return <Divider key={f.id} />;
            case FieldType.card:
                return <CardWrapper key={f.id}>{f.element.children?.map(renderField as any)}</CardWrapper>;
            default:
                return null;
        }
    };

    const renderInputField = (field: UIElement) => {
        const input = field as InputElement;
        const name = input.name as keyof FormValues;

        return (
            <FormField
                key={input.id}
                control={form.control}
                name={name}
                render={({ field: formField }) => {
                    const label =
                        input.label != null ? resolveBinding(input.label, state, t) : null;
                    const placeholder = resolveBinding(input.placeholder, state, t);

                    return (
                        <FormItem className={classesFromStyleProps(input.styles)}>
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
                                                />
                                            );
                                        }

                                        case InputType.textarea: {
                                            return <Textarea placeholder={placeholder}
                                                value={(formField.value as string) ?? ""}
                                                onChange={formField.onChange} />;
                                        }

                                        case InputType.checkbox: {
                                            return (
                                                <Checkbox
                                                    checked={Boolean(formField.value)}
                                                    onCheckedChange={(checked) =>
                                                        formField.onChange(Boolean(checked))
                                                    }
                                                />
                                            );
                                        }

                                        case InputType.select: {
                                            const options: SelectOption[] =
                                                (resolveBinding(input.options, state, t) as
                                                    | SelectOption[]
                                                    | undefined) || [];
                                            return (
                                                <Select
                                                    value={(formField.value as string) ?? ""}
                                                    onValueChange={(v) => formField.onChange(v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={placeholder} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {options.map((opt) => (
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
                                                (resolveBinding(input.options, state, t) as
                                                    | MultiSelectOption[]
                                                    | undefined) || [];
                                            return (
                                                <Multiselect
                                                    options={options}
                                                    value={(formField.value as string[]) || []}
                                                    onChange={(vals) => formField.onChange(vals)}
                                                    placeholder={placeholder}
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
                                                    />
                                                    <div className="text-xs text-muted-foreground">
                                                        {current}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        case InputType.file: {
                                            return (
                                                <FileUpload
                                                    multiple={!!input.multiple}
                                                    accept={input.accept}
                                                    maxSize={input.maxSize}
                                                    files={(formField.value as File[]) || []}
                                                    onFiles={(files) => formField.onChange(files)}
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
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                />
                                            );
                                        }

                                        case InputType.time: {
                                            return (
                                                <Input
                                                    type="time"
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                />
                                            );
                                        }

                                        case InputType.month: {
                                            return (
                                                <Input
                                                    type="month"
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                />
                                            );
                                        }

                                        case InputType.week: {
                                            return (
                                                <Input
                                                    type="week"
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                />
                                            );
                                        }

                                        case InputType.radio: {
                                            const options: SelectOption[] =
                                                (resolveBinding(input.options, state, t) as SelectOption[]) || [];
                                            return (
                                                <div className="space-y-2">
                                                    {options.map((opt) => (
                                                        <label key={opt.value} className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name={name as string}
                                                                value={opt.value}
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
                                                    value={(formField.value as string) ?? "#000000"}
                                                    onChange={formField.onChange}
                                                />
                                            );
                                        }

                                        case InputType.toggle:
                                        case InputType.switch: {
                                            return (
                                                <Checkbox
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
                                                    min={min}
                                                    max={max}
                                                    step={step}
                                                    value={current}
                                                    onChange={(e) => formField.onChange(Number(e.target.value))}
                                                    className="w-full"
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
                                                />
                                            );
                                        }

                                        case InputType.richtext:
                                            return (
                                                <RichTextEditor
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                    placeholder={placeholder}
                                                />
                                            );

                                        case InputType.code:
                                            return (
                                                <CodeInput
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                    placeholder={placeholder}
                                                />
                                            );
                                        case InputType.markdown:
                                            return (
                                                <MarkdownInput
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                    placeholder={placeholder}
                                                />
                                            );
                                        case InputType.currency: {
                                            return (
                                                <CurrencyInput
                                                    value={(formField.value as number | undefined)}
                                                    onChange={(num) => formField.onChange(num)}
                                                    placeholder={placeholder ?? "0.00"}
                                                    // Optional: pass locale/currency from schema if you have them
                                                    // locale={resolveBinding(input.locale, state, t) as string | undefined}
                                                    currency={resolveBinding(input.currency, state, t) as string | undefined}
                                                    minFractionDigits={input.minFractionDigits || 2}
                                                    maxFractionDigits={input.maxFractionDigits || 2}
                                                />
                                            );
                                        }
                                        case InputType.otp: {
                                            return (
                                                <InputOTP
                                                    maxLength={6}
                                                    value={formField.value as string}
                                                    onChange={formField.onChange}
                                                >
                                                    <InputOTPGroup>
                                                        {Array.from({ length: 6 }).map((_, i) => (
                                                            <InputOTPSlot key={i} index={i} />
                                                        ))}
                                                    </InputOTPGroup>
                                                </InputOTP>
                                            );
                                        }
                                        case InputType.createselect: {
                                            const options: CreateSelectOption[] =
                                                (resolveBinding(input.options, state, t) as CreateSelectOption[]) || [];

                                            return (
                                                <CreateSelect
                                                    value={(formField.value as string) ?? ""}
                                                    options={options}
                                                    placeholder={placeholder}
                                                    onChange={(val) => formField.onChange(val)}
                                                    onCreateAction={input.onCreate}
                                                />
                                            );
                                        }

                                        default:
                                            return (
                                                <Input
                                                    type={input.inputType}
                                                    placeholder={placeholder}
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
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
                        {group.formFields.map(renderField)}
                    </CardWrapper>
                );

            case FormGroupType.container:
                return (
                    <ContainerWrapper key={group.id}>
                        {group.formFields.map(renderField)}
                    </ContainerWrapper>
                );

            case FormGroupType.tabs:
                return (
                    <TabGroup
                        key={group.id}
                        group={group}
                        form={form}
                        renderField={renderField}
                    />
                );

            case FormGroupType.step_wizard:
                return (
                    <WizardGroup
                        key={group.id}
                        group={group}
                        form={form}
                        renderField={renderField}
                    />
                );

            default:
                return <div key={group.id}>{group.formFields.map(renderField)}</div>;
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={classesFromStyleProps(element.styles)}
            >
                {renderGroup(element)}
                <Button type="submit">{t("submit")}</Button>
            </form>
        </Form>
    );
}


