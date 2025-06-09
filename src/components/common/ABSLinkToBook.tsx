import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { ReactNode } from "react";
import { Link } from "expo-router";

/*
 * ABSLinkToBook will take the user to the abs book route in the app
 *
 */
interface ABSLinkToBookProps {
  bookId: string;
  children: ReactNode;
  style?: object;
}

const ABSLinkToBook: React.FC<ABSLinkToBookProps> = ({ bookId, children, style }) => {
  return (
    <Link href={`/dropbox/audiobookshelf/${bookId}`} asChild>
      <TouchableOpacity style={[styles.link, style]}>{children}</TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  link: {
    // Default styles can be added here
  },
});

export default ABSLinkToBook;
