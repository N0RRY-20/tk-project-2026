import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const genderEnum = pgEnum("gender", ["laki-laki", "perempuan"]);

export const student = pgTable(
  "student",
  {
    id: text("id")
      .primaryKey()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
    nickname: text("nickname"),
    qrCode: text("qr_code").notNull().unique(),
    gender: genderEnum("gender").notNull(),
    className: text("class_name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("student_qrCode_idx").on(table.qrCode)],
);

export const studentRelations = relations(student, ({ one }) => ({
  user: one(user, {
    fields: [student.id],
    references: [user.id],
  }),
}));
