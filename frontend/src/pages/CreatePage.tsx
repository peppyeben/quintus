import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ImagePlus, X, Plus } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    format,
    setHours,
    setMinutes,
    setSeconds,
    addMinutes,
    addHours,
} from "date-fns";
import { DayPicker } from "react-day-picker";
import TimePicker from "react-time-picker";
import "react-day-picker/dist/style.css";
import "react-time-picker/dist/TimePicker.css";

// Categories for market
const CATEGORIES = [
    "Crypto",
    "Sports",
    "Politics",
    "Entertainment",
    "Technology",
];

// Form validation schema
const marketSchema = z
    .object({
        marketTitle: z
            .string()
            .trim()
            .min(3, "Market title must be at least 3 characters"),
        description: z
            .string()
            .trim()
            .min(10, "Description must be at least 10 characters"),
        category: z.enum(CATEGORIES as [string, ...string[]]),
        thumbnail: z
            .instanceof(File)
            .optional()
            .refine(
                (file) => {
                    if (!file) return true; // Optional, so no file is also valid
                    return file.size <= 1 * 1024 * 1024; // 1MB in bytes
                },
                { message: "Image must be less than 1MB" }
            ),
        outcomes: z
            .array(
                z.object({
                    name: z.string().min(1, "Outcome name cannot be empty"),
                    probability: z.number().min(0).max(100).optional(),
                })
            )
            .min(2, "At least two outcomes required"),
        betDeadline: z.date().refine(
            (betDeadline) => {
                const now = new Date();
                const minBetDeadline = addMinutes(now, 10);
                return betDeadline >= minBetDeadline;
            },
            { message: "Bet deadline must be at least 10 minutes from now" }
        ),
        resolutionDeadline: z.date(),
        betFee: z
            .object({
                type: z.enum(["fixed", "dynamic"]),
                value: z.number().min(0.0025, "Fee must be at least 0.0025"), // Updated minimum value
                minValue: z.number().optional(),
                maxValue: z.number().optional(),
            })
            .refine(
                (data) => {
                    if (data.type === "dynamic") {
                        return (
                            data.maxValue !== undefined &&
                            data.maxValue > (data.minValue ?? data.value)
                        );
                    }
                    return true;
                },
                {
                    message: "Max value must be greater than min value",
                    path: ["maxValue"],
                }
            ),
    })
    .refine(
        (data) => {
            const betDeadline = data.betDeadline;
            const resolutionDeadline = data.resolutionDeadline;

            // Check resolution deadline is at least 1 hour after bet deadline
            const minResolutionDeadline = addHours(betDeadline, 1);
            return resolutionDeadline >= minResolutionDeadline;
        },
        {
            message:
                "Resolution deadline must be at least 1 hour after bet deadline",
            path: ["resolutionDeadline"], // This specifies which field the error is associated with
        }
    );

type MarketFormData = z.infer<typeof marketSchema>;

export const CreatePage: React.FC = () => {
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        null
    );
    const [outcomes, setOutcomes] = useState([
        { name: "", probability: undefined },
        { name: "", probability: undefined },
    ]);
    const [time, setTime] = useState<Date | null>(new Date());

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        trigger,
        clearErrors,
        setError,
    } = useForm<MarketFormData>({
        resolver: zodResolver(marketSchema),
        mode: "onChange", // Validate on every change
        defaultValues: {
            outcomes: [
                { name: "", probability: undefined },
                { name: "", probability: undefined },
            ],
            betFee: { type: "fixed", value: 0 },
        },
    });

    const onSubmit = (data: MarketFormData) => {
        // Perform validation manually
        if (Object.keys(errors).length > 0) {
            // If there are errors, prevent submission
            console.log(errors);
            return;
        }

        console.log("Form Data:", data);
        // Add your submission logic here
    };

    const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1 * 1024 * 1024) {
                // File is larger than 1MB
                setValue("thumbnail", undefined);
                setThumbnailPreview(null);

                // Ensure the error is set correctly
                setError("thumbnail", {
                    type: "manual",
                    message: "Image must be less than 1MB",
                });

                e.target.value = ""; // Clear the file input
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
                setValue("thumbnail", file);
                clearErrors("thumbnail");
            };
            reader.readAsDataURL(file);
        }
    };

    const addOutcome = () => {
        if (outcomes.length < 5) {
            // Limit to 5 outcomes
            const newOutcomes = [
                ...outcomes,
                { name: "", probability: undefined },
            ];
            setOutcomes(newOutcomes);
            setValue("outcomes", newOutcomes);
            trigger("outcomes");
        }
    };

    const removeOutcome = (index: number) => {
        if (outcomes.length > 2) {
            const newOutcomes = outcomes.filter((_, i) => i !== index);
            setOutcomes(newOutcomes);
            setValue("outcomes", newOutcomes);
            trigger("outcomes");
        }
    };

    const updateOutcome = (
        index: number,
        field: "name" | "probability",
        value: string | number
    ) => {
        const newOutcomes = [...outcomes];
        newOutcomes[index] = {
            ...newOutcomes[index],
            [field]: field === "probability" ? Number(value) : value,
        };
        setOutcomes(newOutcomes);
        setValue("outcomes", newOutcomes);
        trigger("outcomes");
    };

    return (
        <motion.div
            className="flex flex-col justify-center items-center mx-auto w-2/3 max-w-[50rem] px-6 py-6 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <p className="text-left mr-auto font-bold text-white text-xl">
                Create New Market
            </p>
            <p className="text-left mr-auto text-gray-400 text-sm">
                Design a prediction market and let the crowd forecast the
                outcome
            </p>

            <motion.form
                onSubmit={handleSubmit(onSubmit)}
                onChange={() => clearErrors()}
                className="flex flex-col py-4 justify-start items-center w-full space-y-5"
            >
                {/* Market Title */}
                <div className="flex flex-col space-y-1 mr-auto w-full">
                    <label className="text-white text-left">Bet Title*</label>
                    <input
                        {...register("marketTitle")}
                        type="text"
                        className="outline-none bg-black text-gray-400 placeholder-gray-400 placeholder:text-sm w-full px-3 py-2 rounded-xl border border-gray-800"
                        placeholder="Enter market title"
                        autoComplete="off"
                    />
                    {errors.marketTitle && (
                        <p className="text-red-500 text-xs">
                            {errors.marketTitle.message}
                        </p>
                    )}
                </div>

                {/* Description */}
                <div className="flex flex-col space-y-1 mr-auto w-full">
                    <label className="text-white text-left">Description*</label>
                    <textarea
                        {...register("description")}
                        className="outline-none bg-black text-gray-400 placeholder-gray-400 placeholder:text-sm w-full px-3 py-2 rounded-xl border border-gray-800"
                        placeholder="Provide a clear description of the bet"
                        rows={4}
                    />
                    {errors.description && (
                        <p className="text-red-500 text-xs">
                            {errors.description.message}
                        </p>
                    )}
                </div>

                {/* Thumbnail Upload */}
                <div className="flex flex-col space-y-1 mr-auto w-full">
                    <label className="text-white text-left">
                        Bet Thumbnail (1mb max.)
                    </label>
                    <div className="flex space-x-4 items-center">
                        <label className="cursor-pointer flex items-center space-x-2 bg-neutral-900 text-white px-4 py-2 rounded-md hover:bg-neutral-800">
                            <ImagePlus className="w-5 h-5" />
                            <span>Upload Image</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleThumbnailUpload}
                            />
                        </label>
                        {thumbnailPreview && (
                            <img
                                src={thumbnailPreview}
                                alt="Thumbnail Preview"
                                className="w-20 h-20 object-cover rounded-md"
                            />
                        )}
                    </div>
                    {errors.thumbnail && (
                        <p className="text-red-500 text-xs">
                            {errors.thumbnail.message}
                        </p>
                    )}
                </div>

                {/* Category Dropdown */}
                <div className="flex flex-col space-y-1 mr-auto w-full">
                    <label className="text-white text-left">Category*</label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <div className="relative w-full">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCategoryOpen(!categoryOpen)
                                    }
                                    className="w-full text-left text-xs px-3 py-2 rounded-md 
                                    border border-neutral-700 bg-neutral-900
                                    flex items-center justify-between
                                    hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <span
                                        className={
                                            field.value
                                                ? "text-white"
                                                : "text-neutral-500"
                                        }
                                    >
                                        {field.value || "Select Category"}
                                    </span>
                                    <ChevronDown
                                        className={`w-5 h-5 transition-transform ${
                                            categoryOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                                {categoryOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {CATEGORIES.map((category) => (
                                            <div
                                                key={category}
                                                onClick={() => {
                                                    field.onChange(category);
                                                    setCategoryOpen(false);
                                                    trigger("category");
                                                }}
                                                className="px-3 py-1 cursor-pointer hover:bg-neutral-800 text-white"
                                            >
                                                {category}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    />
                    {errors.category && (
                        <p className="text-red-500 text-xs">
                            {errors.category.message}
                        </p>
                    )}
                </div>

                {/* Outcomes Section */}
                <div className="flex flex-col space-y-1 mr-auto w-full">
                    <label className="text-white text-left">Outcomes*</label>
                    {outcomes.map((outcome, index) => (
                        <div
                            key={index}
                            className="flex space-x-2 items-center mb-2"
                        >
                            <div className="flex-grow flex space-x-2">
                                <input
                                    type="text"
                                    {...register(`outcomes.${index}.name`)}
                                    value={outcome.name}
                                    onChange={(e) => {
                                        updateOutcome(
                                            index,
                                            "name",
                                            e.target.value
                                        );
                                    }}
                                    className="flex-grow outline-none bg-black text-gray-400 placeholder-gray-400 placeholder:text-sm px-3 py-2 rounded-xl border border-gray-800"
                                    placeholder={`Outcome ${index + 1}`}
                                    autoComplete="off"
                                />
                            </div>
                            {outcomes.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => removeOutcome(index)}
                                    className="text-red-500 hover:bg-red-500/10 rounded-full p-1"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addOutcome}
                        disabled={outcomes.length >= 5}
                        className="mt-2 flex items-center text-blue-500 hover:bg-blue-500/10 rounded-md px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add Outcome
                    </button>
                    {errors.outcomes && (
                        <p className="text-red-500 text-xs">
                            {errors.outcomes.message}
                        </p>
                    )}
                </div>

                {/* Bet Deadline */}

                <div className="flex flex-col space-y-1 mr-auto w-full">
                    <label className="text-white text-left">
                        Bet Deadline*
                    </label>

                    <Controller
                        name="betDeadline"
                        control={control}
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className="w-full text-left text-xs px-3 py-2 rounded-md text-white 
                    border border-neutral-700 bg-neutral-900
                    flex items-center justify-between
                    hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {field.value
                                            ? format(
                                                  field.value,
                                                  "PPP HH:mm:ss"
                                              )
                                            : "Pick a date and time"}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="flex flex-col space-y-2 min-w-fit">
                                    <DayPicker
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(selectedDate) => {
                                            if (selectedDate) {
                                                // Combine selected date with current time
                                                const updatedDate = setSeconds(
                                                    setMinutes(
                                                        setHours(
                                                            selectedDate,
                                                            time?.getHours() ||
                                                                0
                                                        ),
                                                        time?.getMinutes() || 0
                                                    ),
                                                    time?.getSeconds() || 0
                                                );
                                                field.onChange(updatedDate);
                                                trigger("betDeadline");
                                            }
                                        }}
                                    />
                                    <TimePicker
                                        onChange={(newTime: string | null) => {
                                            if (newTime) {
                                                const [
                                                    hours,
                                                    minutes,
                                                    seconds = "00",
                                                ] = newTime.split(":");
                                                const updatedTime = new Date();
                                                updatedTime.setHours(
                                                    parseInt(hours),
                                                    parseInt(minutes),
                                                    parseInt(seconds)
                                                );

                                                setTime(updatedTime);

                                                if (field.value) {
                                                    const updatedDate =
                                                        setSeconds(
                                                            setMinutes(
                                                                setHours(
                                                                    field.value,
                                                                    parseInt(
                                                                        hours
                                                                    )
                                                                ),
                                                                parseInt(
                                                                    minutes
                                                                )
                                                            ),
                                                            parseInt(
                                                                seconds || "0"
                                                            )
                                                        );
                                                    field.onChange(updatedDate);
                                                    trigger("betDeadline");
                                                }
                                            }
                                        }}
                                        value={
                                            time
                                                ? `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
                                                : null
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                </div>

                {/* Resolution Deadline */}
                <div className="flex flex-col space-y-1 mr-auto w-full">
                    <label className="text-white text-left">
                        Resolution Deadline*
                    </label>
                    <Controller
                        name="resolutionDeadline"
                        control={control}
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className="w-full text-left text-xs px-3 py-2 rounded-md text-white 
                    border border-neutral-700 bg-neutral-900
                    flex items-center justify-between
                    hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {field.value
                                            ? format(
                                                  field.value,
                                                  "PPP HH:mm:ss"
                                              )
                                            : "Pick a date and time"}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="flex flex-col space-y-2 min-w-fit">
                                    <DayPicker
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(selectedDate) => {
                                            if (selectedDate) {
                                                // Combine selected date with current time
                                                const updatedDate = setSeconds(
                                                    setMinutes(
                                                        setHours(
                                                            selectedDate,
                                                            time?.getHours() ||
                                                                0
                                                        ),
                                                        time?.getMinutes() || 0
                                                    ),
                                                    time?.getSeconds() || 0
                                                );
                                                field.onChange(updatedDate);
                                                trigger("betDeadline");
                                            }
                                        }}
                                    />
                                    <TimePicker
                                        className="text-black"
                                        onChange={(newTime: string | null) => {
                                            if (newTime) {
                                                const [
                                                    hours,
                                                    minutes,
                                                    seconds = "00",
                                                ] = newTime.split(":");
                                                const updatedTime = new Date();
                                                updatedTime.setHours(
                                                    parseInt(hours),
                                                    parseInt(minutes),
                                                    parseInt(seconds)
                                                );

                                                setTime(updatedTime);

                                                if (field.value) {
                                                    const updatedDate =
                                                        setSeconds(
                                                            setMinutes(
                                                                setHours(
                                                                    field.value,
                                                                    parseInt(
                                                                        hours
                                                                    )
                                                                ),
                                                                parseInt(
                                                                    minutes
                                                                )
                                                            ),
                                                            parseInt(
                                                                seconds || "0"
                                                            )
                                                        );
                                                    field.onChange(updatedDate);
                                                    trigger(
                                                        "resolutionDeadline"
                                                    );
                                                }
                                            }
                                        }}
                                        value={
                                            time
                                                ? `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
                                                : null
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                    {errors.resolutionDeadline && (
                        <p className="text-red-500 text-xs">
                            {errors.resolutionDeadline.message}
                        </p>
                    )}
                </div>

                {/* Bet Fee */}
                <div className="flex flex-col space-y-1 mr-auto w-full">
                    <label className="text-white text-left">Bet Fee*</label>
                    <Controller
                        name="betFee.type"
                        control={control}
                        render={({ field: typeField }) => (
                            <Controller
                                name="betFee.value"
                                control={control}
                                render={({ field: valueField }) => (
                                    <div className="flex space-x-2">
                                        <select
                                            {...typeField}
                                            onChange={(e) => {
                                                typeField.onChange(
                                                    e.target.value
                                                );
                                                // Reset value when type changes
                                                valueField.onChange(0);
                                                trigger("betFee");
                                            }}
                                            className="bg-neutral-900 text-white border border-neutral-700 rounded-md px-3 py-2 text-xs w-1/3"
                                        >
                                            <option value="fixed">
                                                Fixed Fee
                                            </option>
                                            <option value="dynamic">
                                                Dynamic Fee
                                            </option>
                                        </select>
                                        <div className="flex-grow flex space-x-2">
                                            <input
                                                type="number"
                                                {...valueField}
                                                min={0}
                                                step={0.0001}
                                                onChange={(e) => {
                                                    const value = parseFloat(
                                                        parseFloat(
                                                            e.target.value
                                                        ).toFixed(4)
                                                    );
                                                    valueField.onChange(value);
                                                    trigger("betFee.value");
                                                }}
                                                className="flex-grow outline-none bg-black text-gray-400 placeholder-gray-400 placeholder:text-sm px-3 py-2 rounded-xl border border-gray-800"
                                                placeholder={
                                                    typeField.value === "fixed"
                                                        ? "Enter Fixed Fee"
                                                        : "Min Fee"
                                                }
                                            />
                                            {typeField.value === "dynamic" && (
                                                <Controller
                                                    name="betFee.maxValue"
                                                    control={control}
                                                    render={({
                                                        field: maxValueField,
                                                    }) => (
                                                        <input
                                                            type="number"
                                                            {...maxValueField}
                                                            onChange={(e) => {
                                                                const value =
                                                                    parseFloat(
                                                                        parseFloat(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        ).toFixed(
                                                                            4
                                                                        )
                                                                    );
                                                                maxValueField.onChange(
                                                                    value
                                                                );
                                                                trigger(
                                                                    "betFee.maxValue"
                                                                );
                                                            }}
                                                            min={0}
                                                            step={0.0001}
                                                            className="flex-grow outline-none bg-black text-gray-400 placeholder-gray-400 placeholder:text-sm px-3 py-2 rounded-xl border border-gray-800"
                                                            placeholder="Max Fee"
                                                        />
                                                    )}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                            />
                        )}
                    />
                    {errors.betFee?.value && (
                        <p className="text-red-500 text-xs">
                            {errors.betFee.value.message}
                        </p>
                    )}
                    {errors.betFee?.maxValue && (
                        <p className="text-red-500 text-xs">
                            {errors.betFee.maxValue.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col space-y-1 w-full">
                    <section className="flex justify-between items-center px-4 py-2 rounded-lg bg-[#1f1f1f]">
                        <p className="flex flex-col space-y-1 text-left text-sm">
                            <span className="text-white font-bold">Bet Creation Fee</span>
                            <span className="text-[#b1b1b6]">Flat fee for creating a new bet</span>
                        </p>
                        <p className="flex items-center text-green-600 font-bold text-sm">
                            0 BNB
                        </p>
                    </section>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-white text-black py-2 rounded-xl 
                           hover:bg-gray-300 transition-colors duration-300 font-bold
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Create Bet
                </button>
            </motion.form>
        </motion.div>
    );
};

export default CreatePage;
