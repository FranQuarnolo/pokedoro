import React, { useEffect, useMemo } from "react";
import { Modal, Form, Input, Select } from "antd";
import { PokemonSelector } from "../components/pokemon/PokemonSelector";
import type { PomoSession } from "../types";
import styles from "../styles/SessionModal.module.css";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: Partial<PomoSession>;
  onCancel: () => void;
  onSubmit: (values: any) => void; // devolverá { name, pokemonId, pokemonNickname, durationMinutes }
}

const minutesOptions = Array.from({ length: 181 }, (_, i) => ({
  label: `${i}`,
  value: i,
})); // 0..180
const secondsOptions = Array.from({ length: 60 }, (_, i) => ({
  label: `${i}`.padStart(2, "0"),
  value: i,
})); // 0..59

export const SessionModal: React.FC<Props> = ({
  open,
  mode,
  initialValues,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const initMinSec = useMemo(() => {
    const dm = Number(initialValues?.durationMinutes ?? 25);
    const total = Math.max(0, Math.round(dm * 60));
    return { m: Math.floor(total / 60), s: total % 60 };
  }, [initialValues?.durationMinutes]);

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      name: initialValues?.name ?? "",
      pokemonId: initialValues?.pokemonId ?? "pikachu",
      pokemonNickname: initialValues?.pokemonNickname ?? "",
      minutes: initMinSec.m,
      seconds: initMinSec.s,
    });
  }, [open, initialValues, initMinSec, form]);

  const title = mode === "create" ? "Crear Pokedoro" : "Configurar Sesión";
  const okText = mode === "create" ? "Crear" : "Guardar";

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={okText}
      className={styles.modal}
      centered
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false} // oculta asteriscos
        onFinish={(vals) => {
          const totalSeconds = vals.minutes * 60 + vals.seconds;
          const durationMinutes = totalSeconds / 60;

          onSubmit({
            name: vals.name,
            pokemonId: vals.pokemonId.toLowerCase().trim(),
            pokemonNickname: vals.pokemonNickname,
            durationMinutes, // para persistir
            durationSeconds: totalSeconds, // para reset inmediato
          });
          form.resetFields();
        }}
      >
        <Form.Item
          name="name"
          label="Nombre de la sesión"
          rules={[{ required: true, message: "Campo obligatorio" }]}
        >
          <Input placeholder="Ej: Estudio React" />
        </Form.Item>

        <Form.Item
          label="Duración"
          required
          tooltip="Elegí minutos y segundos"
          className={styles.compactLabel}
        >
          <div className={styles.durationRow}>
            <Form.Item name="minutes" noStyle rules={[{ required: true }]}>
              <Select
                className={styles.wheel}
                options={minutesOptions}
                showSearch={false}
                listHeight={240}
                popupMatchSelectWidth={240}
                suffixIcon={null}
              />
            </Form.Item>
            <span className={styles.colon}>:</span>
            <Form.Item name="seconds" noStyle rules={[{ required: true }]}>
              <Select
                className={styles.wheel}
                options={secondsOptions}
                showSearch={false}
                listHeight={240}
                popupMatchSelectWidth={240}
                suffixIcon={null}
              />
            </Form.Item>
          </div>
          <div className={styles.wheelHint}>min — seg</div>
        </Form.Item>

        <Form.Item
          name="pokemonId"
          label="Pokémon"
          rules={[{ required: true, message: "Elegí un Pokémon" }]}
        >
          <PokemonSelector placeholder="Ej: pikachu, gengar, snorlax" />
        </Form.Item>

        <Form.Item name="pokemonNickname" label="Apodo (opcional)">
          <Input placeholder="Ej: Juan" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
