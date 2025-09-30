
import React, { useState, useEffect } from "react";
import { Conclusion } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollText, Plus, Trash2, Pencil, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const argumentTypes = [
  "taxation_without_representation",
  "boston_massacre",
  "tea_act_protest",
  "intolerable_acts",
  "continental_congress",
  "declaration_independence",
  "military_conflict",
  "alliance_formation"
];

const bonusCriterias = ["source_type", "author", "location"];
const argumentsABC = ["A", "B", "C"];
const subArgumentsEPS = ["E", "P", "S"];

const emptyConclusion = {
  title: "",
  description: "",
  bonus_criteria: "",
  argument: "",
  sub_argument: ""
};

export default function ConclusionManager() {
  const [conclusions, setConclusions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentConclusion, setCurrentConclusion] = useState(emptyConclusion);

  useEffect(() => {
    loadConclusions();
  }, []);

  const loadConclusions = async () => {
    const data = await Conclusion.list("-created_date");
    setConclusions(data);
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentConclusion(emptyConclusion);
    setShowForm(true);
  };

  const handleEdit = (conclusion) => {
    setIsEditing(true);
    setCurrentConclusion(conclusion);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this conclusion?")) {
      await Conclusion.delete(id);
      loadConclusions();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // Removed minimum_evidence and argument_type requirements from form.
    // The currentConclusion state already reflects these removals from emptyConclusion.
    // So, we can directly save currentConclusion.
    const dataToSave = { ...currentConclusion };

    if (isEditing) {
      await Conclusion.update(currentConclusion.id, dataToSave);
    } else {
      await Conclusion.create(dataToSave);
    }
    loadConclusions();
    setShowForm(false);
    setCurrentConclusion(emptyConclusion);
  };

  const handleCancel = () => {
    setShowForm(false);
    setCurrentConclusion(emptyConclusion);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentConclusion(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setCurrentConclusion(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 revolution-accent rounded-lg flex items-center justify-center parchment-glow">
              <ScrollText className="w-6 h-6 text-yellow-100" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-yellow-100">Conclusion Manager</h1>
              <p className="text-stone-400 mt-1">Create, edit, and manage historical arguments</p>
            </div>
          </div>
          <Button onClick={handleAddNew} className="revolution-accent hover:bg-red-800 text-yellow-100">
            <Plus className="w-4 h-4 mr-2" />
            Add New Conclusion
          </Button>
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-2xl"
              >
                <Card className="colonial-paper border-2 border-amber-600">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-stone-900">{isEditing ? "Edit" : "Create"} Conclusion</CardTitle>
                      <Button variant="ghost" size="icon" onClick={handleCancel}>
                        <X className="h-5 w-5 text-stone-600" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                      <Input
                        name="title"
                        placeholder="Conclusion Title"
                        value={currentConclusion.title}
                        onChange={handleInputChange}
                        required
                        className="bg-white border-stone-400"
                      />
                      <Textarea
                        name="description"
                        placeholder="Description of the historical argument..."
                        value={currentConclusion.description}
                        onChange={handleInputChange}
                        required
                        className="bg-white border-stone-400"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <Select value={currentConclusion.bonus_criteria || ""} onValueChange={(v) => handleSelectChange('bonus_criteria', v)}>
                          <SelectTrigger className="bg-white border-stone-400"><SelectValue placeholder="Bonus Criteria" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={null}>None</SelectItem>
                            {bonusCriterias.map(type => <SelectItem key={type} value={type}>{type.replace(/_/g, ' ')}</SelectItem>)}
                          </SelectContent>
                        </Select>
                         <Select value={currentConclusion.argument || ""} onValueChange={(v) => handleSelectChange('argument', v)}>
                          <SelectTrigger className="bg-white border-stone-400"><SelectValue placeholder="Argument Tag" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={null}>None</SelectItem>
                            {argumentsABC.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                          </SelectContent>
                        </Select>
                         <Select value={currentConclusion.sub_argument || ""} onValueChange={(v) => handleSelectChange('sub_argument', v)}>
                          <SelectTrigger className="bg-white border-stone-400"><SelectValue placeholder="Sub-Argument Tag" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={null}>None</SelectItem>
                            {subArgumentsEPS.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={handleCancel} className="border-stone-600 text-stone-700">Cancel</Button>
                        <Button type="submit" className="revolution-accent hover:bg-red-800 text-yellow-100">{isEditing ? "Save Changes" : "Create Conclusion"}</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Conclusions List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conclusions.map(conclusion => (
            <Card key={conclusion.id} className="colonial-paper border-2 border-amber-600 flex flex-col">
              <CardHeader>
                <CardTitle className="text-stone-900 text-base">{conclusion.title}</CardTitle>
                {/* Display argument_type if it exists, even if not editable via form */}
                {conclusion.argument_type && (
                  <p className="text-xs text-stone-600 capitalize">{conclusion.argument_type.replace(/_/g, ' ')}</p>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-stone-700 line-clamp-4">{conclusion.description}</p>
              </CardContent>
              <div className="p-4 pt-0 flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(conclusion)} className="text-stone-600 hover:text-blue-600">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(conclusion.id)} className="text-stone-600 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
