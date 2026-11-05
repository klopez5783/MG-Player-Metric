package com.example.demo.repositories;

import com.example.demo.entities.Attribute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttributeRepository extends JpaRepository<Attribute, Integer> {
    List<Attribute> findAllByOrderByDisplayOrderAsc();


    // Lets the save logic resolve a payload's attribute name (e.g. "Pace")
    // to a real row, until the frontend sends ids directly instead.
    Optional<Attribute> findByName(String name);
}
