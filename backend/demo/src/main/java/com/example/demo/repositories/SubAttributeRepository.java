package com.example.demo.repositories;

import com.example.demo.entities.SubAttribute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubAttributeRepository extends JpaRepository<SubAttribute, Integer> {
    List<SubAttribute> findAllByOrderByDisplayOrderAsc();


    // Same name-lookup convenience as AttributeRepository.findByName — only
    // safe while sub-attribute names stay unique across every category
    // (true for the current seed; not enforced at the database level).
    Optional<SubAttribute> findByName(String name);
}
